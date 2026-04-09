import { readFile, writeFile, readdir, access } from 'fs/promises';
import { createHash } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import countries3to2 from 'countries-list/minimal/countries.3to2.min.json' with { type: 'json' };
import { iso6393To1 } from 'iso-639-3';

import type {
  CombinedData, CombinedLanguageData, CountryLanguageData, RawLanguageFile, UnicodeData
} from '@atlasl2/shared';


const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

const unicodeFilePath = path.join(repoRoot, 'data/countries/unicode.json');
const outputDir = path.join(repoRoot, 'data/languages/output');
const combinedLanguagesOut = path.join(repoRoot, 'data/combined_languages.json');
const combinedDataOut = path.join(repoRoot, 'data/combined_data.json');

const LANG_OVERRIDES: Record<string, string[]> = {
  ARB: ['ar'],
  AZB: ['azb'],
  AZJ: ['azj'],
  CMN: ['zh'],
  NPI: ['ne'],
  PES: ['fa'],
  PNB: ['pnb'],
  PAN: ['pan'],
  PRS: ['fa', 'prs'],
  SWH: ['sw'],
  TGL: ['tl', 'fil'],
  UZN: ['uz'],
  YUE: ['yue'],
  WUU: ['wuu'],
  NAN: ['nan'],
};

const UNICODE_LANG_ALIASES: Record<string, string> = {
  pa: 'pan',
  pa_arab: 'pnb',
  az: 'azj',
  az_cyrl: 'azj',
  az_arab: 'azb',
};


function normalizeLanguageCodes(langISO3Code: string): string[] {
  const overrideCodes = LANG_OVERRIDES[langISO3Code];
  if (overrideCodes) {
    return overrideCodes;
  }

  const alpha1 = iso6393To1[langISO3Code.toLowerCase()];
  if (alpha1) {
    return [alpha1.toLowerCase()];
  }

  return [langISO3Code.toLowerCase()];
}

function resolveUnicodePopulation(
  unicodeData: UnicodeData,
  countryAlpha2: string | undefined,
  targetCodes: string[]
): number {
  if (!countryAlpha2) {
    return 0;
  }

  const entries = unicodeData[countryAlpha2];
  if (!entries) {
    return 0;
  }

  const normalizedTargetCodes = new Set(targetCodes.map((code) => code.toLowerCase()));
  const exactMatches: number[] = [];
  const baseMatches: number[] = [];

  for (const entry of entries) {
    const pop = entry.pop ?? 0;
    const rawCode = (entry.lang_code ?? '').toLowerCase();
    const aliasedRawCode = UNICODE_LANG_ALIASES[rawCode] ?? rawCode;
    const baseCode = aliasedRawCode.split('_')[0].split('-')[0];

    if (normalizedTargetCodes.has(aliasedRawCode)) {
      exactMatches.push(pop);
      continue;
    }

    if (normalizedTargetCodes.has(baseCode)) {
      baseMatches.push(pop);
    }
  }

  // Unicode buckets can overlap (e.g. zh + zh_Hans), so avoid additive double counting.
  if (exactMatches.length > 0) {
    return Math.max(...exactMatches);
  }

  if (baseMatches.length > 0) {
    return Math.max(...baseMatches);
  }

  return 0;
}

function resolveCountryAlpha2(countryAlpha3: string): string | undefined {
  return countries3to2[countryAlpha3.toUpperCase() as keyof typeof countries3to2];
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}


async function main() {
  const blockedOutputs = (
    await Promise.all([combinedLanguagesOut, combinedDataOut].map(
      async (filePath) => (await fileExists(filePath) ? filePath : null)
    ))
  ).filter((filePath): filePath is string => filePath !== null);

  if (blockedOutputs.length > 0) {
    for (const blockedOutput of blockedOutputs) {
      console.error(`Error: Output file already exists at '${path.relative(repoRoot, blockedOutput)}'.`);
    }
    process.exit(1);
  }

  const unicodeRaw = await readFile(unicodeFilePath, 'utf8');
  const unicodeData = JSON.parse(unicodeRaw) as UnicodeData;
  const outputFiles = (await readdir(outputDir))
    .filter((fileName) => fileName.endsWith('.json'))
    .sort();

  const sourceHash = createHash('sha256');
  sourceHash.update(`unicode:${path.relative(repoRoot, unicodeFilePath)}\n`);
  sourceHash.update(unicodeRaw);

  const combinedLanguages: CombinedLanguageData = {};
  const combinedData: CombinedData = {
    metadata: {
      generatedAt: '',
      sourceHash: '',
    },
    languages: {},
    countries: {},
  };

  for (const fileName of outputFiles) {
    const filePath = path.join(outputDir, fileName);
    const rawFileText = await readFile(filePath, 'utf8');
    sourceHash.update(`\nfile:${path.relative(repoRoot, filePath)}\n`);
    sourceHash.update(rawFileText);

    const rawLanguageFile = JSON.parse(rawFileText) as RawLanguageFile;
    const langISO3Code = (rawLanguageFile.language_code ?? path.basename(fileName, '.json')).toUpperCase();
    const targetCodes = normalizeLanguageCodes(langISO3Code);
    const ethCountries = rawLanguageFile.countries ?? {};

    const countryObj: Record<string, CountryLanguageData> = {};

    for (const [countryAlpha3, ethStats] of Object.entries(ethCountries)) {
      const countryAlpha2 = resolveCountryAlpha2(countryAlpha3);
      const unicodeTotal = resolveUnicodePopulation(unicodeData, countryAlpha2, targetCodes);
      const { flag_reason: flagReason, total: ethTotal } = ethStats;
      const combinedTotal = Math.max(ethTotal, unicodeTotal);

      const countryRecord: CountryLanguageData = {
        ethnologue: {
          L1: ethStats.L1 ?? 0,
          L2: ethStats.L2 ?? 0,
          total: ethTotal,
        },
        unicode: {
          total: unicodeTotal,
        },
        patch: {
          flag_reason: undefined,
          total: -1,
        }, // Ensure order
        total: combinedTotal,
      };

      if (countryRecord.patch && (ethStats.flag_for_review || flagReason)) {
        if (flagReason) {
          countryRecord.patch.flag_reason = flagReason;
        } else {
          delete countryRecord.patch.flag_reason;
        }
      } else {
        delete countryRecord.patch;
      }

      countryObj[countryAlpha3] = countryRecord;

      if (!combinedData.languages[langISO3Code]) {
        combinedData.languages[langISO3Code] = {};
      }
      combinedData.languages[langISO3Code][countryAlpha3] = combinedTotal;

      if (!combinedData.countries[countryAlpha3]) {
        combinedData.countries[countryAlpha3] = {};
      }
      combinedData.countries[countryAlpha3][langISO3Code] = combinedTotal;
    }

    combinedLanguages[langISO3Code] = countryObj;
  }

  combinedData.metadata.generatedAt = new Date().toISOString();
  combinedData.metadata.sourceHash = sourceHash.digest('hex');

  await writeFile(combinedLanguagesOut, `${JSON.stringify(combinedLanguages, null, 2)}\n`, 'utf8');
  await writeFile(combinedDataOut, `${JSON.stringify(combinedData, null, 2)}\n`, 'utf8');

  console.log(
    `Successfully generated ${Object.keys(combinedLanguages).length} languages into '${path.relative(repoRoot, combinedLanguagesOut)}' and '${path.relative(repoRoot, combinedDataOut)}'`
  );
}


main();
