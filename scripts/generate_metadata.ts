import { access, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import countryLanguage from '@ladjs/country-language';
import { parse } from 'csv-parse/sync';
import { countries } from 'countries-list';
import countries3to2 from 'countries-list/minimal/countries.3to2.min.json' with { type: 'json' };

import type { CountryMetadataMap, CountryOfficialScript, WorldBankCountryRow } from '@atlasl2/shared';


const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const worldBankCsvPath = path.join(repoRoot, 'data/countries/countries_worldbank.csv');
const outputPath = path.join(repoRoot, 'data/country_metadata.json');

const CSV_HEADERS = {
  year: 'Time',
  countryName: 'Country Name',
  countryCode: 'Country Code',
  population: 'Population, total [SP.POP.TOTL]',
  gdpPerCapNominal: 'GDP per capita (current US$) [NY.GDP.PCAP.CD]',
  gdpPerCapPpp: 'GDP per capita, PPP (current international $) [NY.GDP.PCAP.PP.CD]',
  gdpNominal: 'GDP (current US$) [NY.GDP.MKTP.CD]',
  gdpPpp: 'GDP, PPP (current international $) [NY.GDP.MKTP.PP.CD]',
} as const;


function parseNumericValue(input: string): number | null {
  const value = input.trim();
  if (!value || value === '..') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveScriptForLanguage(countryAlpha2: string | undefined, targetIso3: string): string | null {
  if (!countryAlpha2) {
    return null;
  }

  const countryRecord = countryLanguage.getCountry(countryAlpha2);
  const languageRecord = countryRecord?.languages?.find((language) => language.iso639_3 === targetIso3);
  const candidateLocales = [
    ...(languageRecord?.langCultureMs ?? []).map((locale) => locale.langCultureName),
    ...(countryRecord?.langCultureMs ?? []).map((locale) => locale.langCultureName),
  ].filter((locale): locale is string => Boolean(locale));

  const upperCountry = countryAlpha2.toUpperCase();

  for (const localeName of candidateLocales) {
    const parts = localeName.split('-').filter(Boolean);
    if (parts.length === 0) {
      continue;
    }

    const region = parts[parts.length - 1]?.toUpperCase();
    if (region && region !== upperCountry) {
      continue;
    }

    for (const part of parts) {
      if (/^[A-Za-z]{4}$/.test(part)) {
        return `${part[0].toUpperCase()}${part.slice(1).toLowerCase()}`;
      }
    }

    try {
      const script = new Intl.Locale(localeName).maximize().script;
      if (script && /^[A-Za-z]{4}$/.test(script)) {
        return `${script[0].toUpperCase()}${script.slice(1).toLowerCase()}`;
      }
    } catch {
      continue;
    }
  }

  const iso1 = (languageRecord?.iso639_1 ?? '').trim().toLowerCase();
  if (iso1) {
    try {
      const script = new Intl.Locale(iso1).maximize().script;
      if (script && /^[A-Za-z]{4}$/.test(script)) {
        return `${script[0].toUpperCase()}${script.slice(1).toLowerCase()}`;
      }
    } catch {
      return null;
    }
  }

  return null;
}

function parseWorldBankCsv(csvText: string): Map<string, WorldBankCountryRow> {
  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as Array<Record<string, string>>;

  if (rows.length === 0) {
    throw new Error('World Bank CSV is empty or malformed.');
  }

  const result = new Map<string, WorldBankCountryRow>();

  for (const row of rows) {
    if ((row[CSV_HEADERS.year] ?? '').trim() !== '2024') {
      continue;
    }

    const countryCode = (row[CSV_HEADERS.countryCode] ?? '').trim().toUpperCase();
    const countryName = (row[CSV_HEADERS.countryName] ?? '').trim();

    if (!countryCode || countryCode.length !== 3) {
      continue;
    }

    const population = parseNumericValue(row[CSV_HEADERS.population] ?? '');

    result.set(countryCode, {
      id: countryCode,
      countryName,
      population: population ?? 0,
      gdp: {
        per_capita_nominal: parseNumericValue(row[CSV_HEADERS.gdpPerCapNominal] ?? ''),
        per_capita_ppp: parseNumericValue(row[CSV_HEADERS.gdpPerCapPpp] ?? ''),
        nominal: parseNumericValue(row[CSV_HEADERS.gdpNominal] ?? ''),
        ppp: parseNumericValue(row[CSV_HEADERS.gdpPpp] ?? ''),
      },
    });
  }

  return result;
}

async function main() {
  try {
    await access(outputPath);
    console.error(`Error: Output file already exists at '${path.relative(repoRoot, outputPath)}'.`);
    process.exit(1);
  } catch {
    // expected when output does not exist
  }

  const worldBankCsvRaw = await readFile(worldBankCsvPath, 'utf8');
  const worldBankRows = parseWorldBankCsv(worldBankCsvRaw);
  const countryMetadata: CountryMetadataMap = {};

  for (const [countryAlpha3, row] of worldBankRows.entries()) {
    const countryAlpha2 = countries3to2[countryAlpha3 as keyof typeof countries3to2];
    const countryData = countryAlpha2 ? countries[countryAlpha2 as keyof typeof countries] : undefined;

    if (!countryData) {
      continue;
    }

    const languageIso3Codes = [
      ...new Set(
        (countryLanguage.getCountry(countryAlpha2)?.languages ?? [])
          .map((language) => language.iso639_3?.toLowerCase())
          .filter((iso3): iso3 is string => Boolean(iso3))
      ),
    ];

    const officialScripts: CountryOfficialScript[] = languageIso3Codes.map((languageIso3) => ({
      iso3: languageIso3,
      primary_script: resolveScriptForLanguage(countryAlpha2, languageIso3),
    }));

    const flag = countryAlpha2 && countryAlpha2.length === 2
      ? String.fromCodePoint(...[...countryAlpha2.toUpperCase()].map((char) => 0x1f1a5 + char.charCodeAt(0)))
      : '';

    countryMetadata[countryAlpha3] = {
      id: countryAlpha3,
      name: countryData.name || row.countryName,
      flag,
      region: countryData.continent,
      population: row.population,
      gdp: row.gdp,
      official_scripts: officialScripts,
    };
  }

  await writeFile(outputPath, `${JSON.stringify(countryMetadata, null, 2)}\n`, 'utf8');
  console.log(`Successfully generated ${Object.keys(countryMetadata).length} countries into '${path.relative(repoRoot, outputPath)}'.`);
}


main()
