import { normalizePrevalence, toSigFig } from '../utils';

import type { ExploreRequest, ExploreResponse, RegionalDistribution } from '@atlasl2/shared';
import type { AppData } from '../types';


function sumCountryPopulation(dataStore: AppData, countries: string[]): number {
  return countries.reduce((sum, countryCode) => {
    const country = dataStore.countryMetadata[countryCode];
    return sum + (country?.population ?? 0);
  }, 0);
}

function sumLangSpeakers(dataStore: AppData, languageCode: string, countries: string[]): number {
  return countries.reduce((sum, countryCode) => {
    return sum + (dataStore.combinedData.languages[languageCode]?.[countryCode] ?? 0);
  }, 0);
}


export default function buildExploreResponse(dataStore: AppData, body: ExploreRequest): ExploreResponse {
  const selectedCountries = body.countries.length > 0 ? body.countries : Object.keys(dataStore.countryMetadata);
  const selectedLanguages = body.languages ?? []
  const selectedPopulation = sumCountryPopulation(dataStore, selectedCountries);

  // If selected languages, return breakdown of those languages within the countries
  // Otherwise return top 5 languages across that selected country.
  const topLanguages: RegionalDistribution[] = selectedLanguages.length > 0
    ? selectedLanguages.map(lang => {
      const speakers = toSigFig(sumLangSpeakers(dataStore, lang, selectedCountries));
      return {
        lang,
        prevalence: normalizePrevalence(speakers, selectedPopulation),
        population: speakers,
      };
    })
    : Object.entries(selectedCountries.reduce<Record<string, number>>((counts, countryCode) => {
      const countryLangMap = dataStore.combinedData.countries[countryCode] ?? {};

      for (const [languageCode, speakers] of Object.entries(countryLangMap)) {
        counts[languageCode] = (counts[languageCode] ?? 0) + speakers;
      }

      return counts;
    }, {}))
      .map(([languageCode, speakers]) => ({
        lang: languageCode,
        prevalence: normalizePrevalence(speakers, selectedPopulation),
        population: toSigFig(speakers),
      }))
      .sort((left, right) => right.prevalence - left.prevalence)
      .slice(0, 5);

  return {
    selectedPopulation,
    topLanguages,
  };
}
