import { buildCountryReach } from './probability';

import type { ReachRequest, ReachResponse } from '@atlasl2/shared';
import type { AppData } from '../types';


export function buildReachResponse(dataStore: AppData, body: ReachRequest): ReachResponse {
  return computeReach(dataStore, body.languages, body.targets);
}

export function computeReach(
  dataStore: AppData,
  languages: ReachRequest['languages'],
  targets: ReachRequest['targets']
) {
  const selectedTargets = targets.length > 0
    ? targets
    : Object.keys(dataStore.countryMetadata);

  const breakdown: Record<string, number> = {};
  let weightedTotal = 0;
  let totalPopulation = 0;

  for (const target of selectedTargets) {
    const country = dataStore.countryMetadata[target];
    if (!country) {
      continue;
    }

    const reach = buildCountryReach(dataStore, target, languages);
    breakdown[target] = reach;

    weightedTotal += reach * country.population;
    totalPopulation += country.population;
  }

  return {
    globalIndex: totalPopulation > 0 ? weightedTotal / totalPopulation : 0,
    breakdown,
  };
}
