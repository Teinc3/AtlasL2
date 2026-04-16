import { toCountryDisplayName, toLanguageDisplayName } from "./autocomplete";

import type {
  CountryMetadata, CountryMetadataMap, LanguageMetadataMap
} from "@atlasl2/shared";


const compactPopulationFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCompactPopulation(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return "0";
  }

  return compactPopulationFormatter.format(value).replace(/\s+/g, "");
}

export function formatGapRecommendation(marginalGain: number, estimatedPopulationGain: number): string {
  const percentGain = Math.round(marginalGain * 100);
  if (estimatedPopulationGain <= 0) {
    return `+${percentGain}%`;
  }

  return `+${percentGain}% (~${estimatedPopulationGain.toLocaleString()})`;
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
