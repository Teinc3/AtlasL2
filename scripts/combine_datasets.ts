import { readFile, writeFile, readdir, access } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { countries } from 'countries-list';
import { iso6393To1 } from 'iso-639-3';

import type {
  CombinedLanguageData, CountryLanguageData, RawLanguageFile, UnicodeData,
} from '@atlasl2/shared';


const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

const unicodeFilePath = path.join(repoRoot, 'data/countries/unicode.json');
const outputDir = path.join(repoRoot, 'data/languages/output');
const combinedOut = path.join(repoRoot, 'data/combined_languages.json');

const LANG_OVERRIDES: Record<string, string[]> = {
  ARB: ['ar'],
  AZB: ['az'],
  AZJ: ['az'],
  CMN: ['zh'],
  NPI: ['ne'],
  PES: ['fa'],
  PNB: ['pa'],
  PAN: ['pa'],
  PRS: ['fa', 'prs'],
  SWH: ['sw'],
  TGL: ['tl', 'fil'],
  UZN: ['uz'],
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

  let unicodePopulation = 0;

  for (const entry of entries) {
    const rawCode = (entry.lang_code ?? '').toLowerCase();
    const baseCode = rawCode.split('_')[0].split('-')[0];

    if (targetCodes.includes(baseCode) || targetCodes.includes(rawCode)) {
      unicodePopulation += entry.pop ?? 0;
    }
  }

  return unicodePopulation;
}

function resolveCountryAlpha2(countryAlpha3: string): string | undefined {
  for (const [alpha2, country] of Object.entries(countries)) {
    if (country.alpha3 === countryAlpha3) {
      return alpha2;
    }
  }

  return undefined;
}


async function main() {
  const unicodeData = JSON.parse(await readFile(unicodeFilePath, 'utf8')) as UnicodeData;
  const outputFiles = (await readdir(outputDir)).filter((fileName) => fileName.endsWith('.json'));

  const combinedResults: CombinedLanguageData<string> = {};

  for (const fileName of outputFiles) {
    const filePath = path.join(outputDir, fileName);
    const rawLanguageFile = JSON.parse(await readFile(filePath, 'utf8')) as RawLanguageFile;
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
        patch: {}, // Ensure order
        total: combinedTotal,
      };

      if (ethStats.flag_for_review || flagReason) {
        if (flagReason) {
          countryRecord.patch.flag_reason = flagReason;
        }
        countryRecord.patch.total = -1 // for Manual review

      } else {
        delete countryRecord.patch;
      }

      countryObj[countryAlpha3] = countryRecord;
    }

    combinedResults[langISO3Code] = {
      language: langISO3Code,
      countries: countryObj,
    };
  }

  try {
    await access(combinedOut);
    console.error(`Error: Output file already exists at '${path.relative(repoRoot, combinedOut)}'.`);
    process.exit(1);
  } catch {}

  await writeFile(combinedOut, `${JSON.stringify(combinedResults, null, 2)}\n`, 'utf8');
  console.log(`Successfully combined ${Object.keys(combinedResults).length} languages into '${path.relative(repoRoot, combinedOut)}'`);
}


main();
