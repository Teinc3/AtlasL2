import { CommunicativeMode } from '@atlasl2/shared';
import { buildCountryReach } from './probability';
import { toSigFig } from '../utils';

import type { 
  ReachCountryMetrics, ReachRequest, ReachResponse, TopContributingRegion
} from '@atlasl2/shared';
import type { AppData } from '../types';


export function buildReachResponse(dataStore: AppData, body: ReachRequest): ReachResponse {
  return computeReach(dataStore, body.languages, body.targets, body.mode);
}

export function computeReach(
  dataStore: AppData,
  languages: ReachRequest['languages'],
  targets: ReachRequest['targets'],
  mode: CommunicativeMode
) {
  const selectedTargets = targets.length > 0
    ? targets
    : Object.keys(dataStore.countryMetadata);

  const breakdown: Record<string, ReachCountryMetrics> = {};
  const topContributingRegions: TopContributingRegion[] = [];
  let weightedTotal = 0;
  let totalPopulation = 0;

  for (const target of selectedTargets) {
    const country = dataStore.countryMetadata[target];
    if (!country) {
      continue;
    }

    const reach = buildCountryReach(dataStore, target, languages, mode);
    const reachable = toSigFig(country.population * reach);
    const unreachable = toSigFig(Math.max(0, country.population - (country.population * reach)));

    breakdown[target] = {
      score: reach,
      reachable,
      unreachable,
    };

    const estimatedSpeakers = country.population * reach;
    if (estimatedSpeakers > 0) {
      topContributingRegions.push({
        countryID: target,
        score: reach,
        estimatedSpeakers: toSigFig(estimatedSpeakers),
      });
    }

    weightedTotal += reach * country.population;
    totalPopulation += country.population;
  }

  topContributingRegions.sort((left, right) => right.estimatedSpeakers - left.estimatedSpeakers);

  return {
    globalIndex: totalPopulation > 0 ? weightedTotal / totalPopulation : 0,
    breakdown,
    topContributingRegions: topContributingRegions.slice(0, 5),
  };
}
