import { toCountryDisplayName, toLanguageDisplayName } from "./autocomplete";

import type {
  CountryMetadata, CountryMetadataMap, LanguageMetadataMap,
  ExploreResponse, ReachResponse,
} from "@atlasl2/shared";
import type { TopLanguageEntry } from "../types";


export function computeTotalSelectedPopulation(
  selectedCountries: string[],
  countryMetadata: CountryMetadataMap
): number {
  return selectedCountries.reduce((sum, countryId) => {
    const population = countryMetadata[countryId]?.population ?? 0;
    return sum + population;
  }, 0);
}

export function computeCountriesOnlyTopFive(
  selectedCountries: string[],
  countryMetadata: CountryMetadataMap,
  explore: ExploreResponse | null,
  primaryCountryID: string | null,
  hasSingleCountry: boolean,
  totalSelectedPopulation: number
): TopLanguageEntry[] {
  const singleCountryExplore = primaryCountryID ? (explore?.[primaryCountryID] ?? []) : [];

  if (hasSingleCountry) {
    return singleCountryExplore.slice(0, 5);
  }

  return Object.entries(
    selectedCountries.reduce<Record<string, number>>((acc, countryId) => {
      const countryPopulation = countryMetadata[countryId]?.population ?? 0;
      if (!countryPopulation) {
        return acc;
      }

      for (const entry of explore?.[countryId] ?? []) {
        acc[entry.lang] = (acc[entry.lang] ?? 0) + entry.prevalence * countryPopulation;
      }

      return acc;
    }, {})
  )
    .map(([lang, weightedPopulation]) => ({
      lang,
      prevalence: totalSelectedPopulation > 0 ? weightedPopulation / totalSelectedPopulation : 0,
    }))
    .sort((a, b) => b.prevalence - a.prevalence)
    .slice(0, 5);
}

export function formatGapRecommendation(marginalGain: number, scopePopulation: number): string {
  const percentGain = Math.round(marginalGain * 100);
  if (scopePopulation <= 0) {
    return `+${percentGain}%`;
  }

  const estimatedPopulationIncrease = Math.round(scopePopulation * marginalGain);
  return `+${percentGain}% (~${estimatedPopulationIncrease.toLocaleString()})`;
}

export function formatPPPBillions(value: number | null): string {
  if (value === null) {
    return "USD N/A";
  }

  const billions = value / 1_000_000_000;
  return `USD ${billions.toLocaleString(undefined, { maximumFractionDigits: 0 })} billion`;
}

export function formatPPPPerCapita(value: number | null): string {
  if (value === null) {
    return "USD N/A";
  }

  return `USD ${Math.round(value).toLocaleString()}`;
}

export function buildSingleCountryOfficialLanguages(
  primaryCountry: CountryMetadata | null,
  languageMetadata: LanguageMetadataMap,
  englishLanguageDisplayNames: Intl.DisplayNames
): string[] {
  if (!primaryCountry) {
    return [];
  }

  const languageCodes = Array.from(new Set(primaryCountry.official_scripts.map((entry) => entry.iso3.toUpperCase())));

  return languageCodes.map((languageCode) => {
    const normalizedLanguageCode = languageCode.toLowerCase();
    const baseName = toLanguageDisplayName(languageCode, languageMetadata);
    const foreignName = new Intl.DisplayNames([normalizedLanguageCode, "en"], { type: "language" }).of(normalizedLanguageCode)
      ?? englishLanguageDisplayNames.of(normalizedLanguageCode);
    const localizedForeignName = foreignName?.replace(/\p{L}+/gu, (word) => (
      word.charAt(0).toLocaleUpperCase(normalizedLanguageCode) + word.slice(1)
    ));

    return localizedForeignName && localizedForeignName !== baseName
      ? `${baseName} (${localizedForeignName})`
      : baseName;
  });
}

export function buildSingleCountryPrimaryScripts(
  primaryCountry: CountryMetadata | null,
  scriptDisplayNames: Intl.DisplayNames
): string[] {
  if (!primaryCountry) {
    return [];
  }

  return Array.from(new Set(
    primaryCountry.official_scripts
      .map((entry) => entry.primary_script)
      .filter((scriptCode): scriptCode is string => Boolean(scriptCode))
  )).map((scriptCode) => scriptDisplayNames.of(scriptCode) ?? scriptCode);
}

export function computeLanguageViewTitle(
  hasCountries: boolean,
  hasSingleCountry: boolean,
  primaryCountry: CountryMetadata | null,
  selectedCountries: string[],
  countryMetadata: CountryMetadataMap
): string {
  if (!hasCountries) {
    return "Global Linguistic Footprint";
  }

  if (hasSingleCountry) {
    return `Selected Country: ${primaryCountry?.name ?? toCountryDisplayName(selectedCountries[0], countryMetadata)}`;
  }

  return "Selected Region";
}

export function computeCircleScore(
  hasSingleCountry: boolean,
  primaryCountryID: string | null,
  reach: ReachResponse | null
): number | undefined {
  return hasSingleCountry ? reach?.breakdown[primaryCountryID ?? ""] : reach?.globalIndex;
}

export function computeTopContributors(reach: ReachResponse | null): [string, number][] {
  return Object.entries(reach?.breakdown ?? {})
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .slice(0, 3);
}

export function computeRegionalReachability(
  primaryCountry: CountryMetadata | null,
  primaryCountryID: string | null,
  reach: ReachResponse | null
): { reachable: number; unreachable: number } {
  const regionalScore = primaryCountryID ? reach?.breakdown[primaryCountryID] : undefined;
  const reachable = primaryCountry && regionalScore !== undefined
    ? Math.round(primaryCountry.population * regionalScore)
    : 0;
  const unreachable = primaryCountry && regionalScore !== undefined
    ? Math.max(0, primaryCountry.population - reachable)
    : 0;

  return { reachable, unreachable };
}
