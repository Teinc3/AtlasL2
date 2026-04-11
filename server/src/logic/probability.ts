import { normaliseProbability, normalizePrevalence } from '../utils';

import type { ReachRequest } from '@atlasl2/shared';
import type { AppData } from '../types';


export function calculateIndependentReach(probabilities: number[]): number {
  const unreachable = probabilities.reduce((acc, p) => {
    return acc * (1 - normaliseProbability(p));
  }, 1);

  return 1 - unreachable;
}

export function buildCountryReach(
  dataStore: AppData,
  countryCode: string,
  languages: ReachRequest['languages']
): number {
  const country = dataStore.countryMetadata[countryCode];
  if (!country) {
    return 0;
  }

  const countryLangMap = dataStore.combinedData.countries[countryCode] ?? {};
  const probabilities = languages.map((languageCode) => {
    return normalizePrevalence(countryLangMap[languageCode] ?? 0, country.population);
  });

  return calculateIndependentReach(probabilities);
}
