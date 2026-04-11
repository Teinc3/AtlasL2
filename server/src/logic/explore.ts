import { normalizePrevalence } from '../utils';

import type { ExploreResponse, RegionalDistribution } from '@atlasl2/shared';
import type { AppData } from '../types';


export function findUnknownTargets(dataStore: AppData, targets: string[]): string[] {
  return targets.filter((countryCode) => !dataStore.countryMetadata[countryCode]);
}

export function buildExploreResponse(dataStore: AppData, targets: string[]): ExploreResponse {
  const response: ExploreResponse = {};

  for (const target of targets) {
    const countryLangMap = dataStore.combinedData.countries[target] ?? {};
    const population = dataStore.countryMetadata[target]?.population ?? 0;

    const distributions: RegionalDistribution[] = Object.entries(countryLangMap)
      .map(([lang, speakers]) => ({
        lang,
        prevalence: normalizePrevalence(speakers, population),
      }))
      .sort((left, right) => right.prevalence - left.prevalence);

    response[target] = distributions;
  }

  return response;
}
