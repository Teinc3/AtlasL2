import { toSignificantFigures } from '../utils';

import type { ExploreResponse, RegionalDistribution } from '@atlasl2/shared';
import type { AppData } from '../types';


export function findUnknownTargets(dataStore: AppData, targets: string[]): string[] {
  return targets.filter((countryCode) => !dataStore.countryMetadata[countryCode]);
}

export function buildExploreResponse(dataStore: AppData, targets: string[]): ExploreResponse {
  const selectedTargets = targets.length > 0 ? targets : Object.keys(dataStore.countryMetadata);
  const weightedLanguageCounts: Record<string, number> = {};
  let selectedPopulation = 0;

  for (const target of selectedTargets) {
    const population = dataStore.countryMetadata[target]?.population ?? 0;
    if (!population) {
      continue;
    }

    selectedPopulation += population;
    const countryLangMap = dataStore.combinedData.countries[target] ?? {};

    for (const [lang, speakers] of Object.entries(countryLangMap)) {
      weightedLanguageCounts[lang] = (weightedLanguageCounts[lang] ?? 0) + speakers;
    }
  }

  const topLanguages: RegionalDistribution[] = Object.entries(weightedLanguageCounts)
    .map(([lang, speakers]) => ({
      lang,
      prevalence: selectedPopulation > 0 ? speakers / selectedPopulation : 0,
      population: toSignificantFigures(speakers),
    }))
    .sort((left, right) => right.prevalence - left.prevalence)
    .slice(0, 5);

  return {
    selectedPopulation,
    topLanguages,
  };
}
