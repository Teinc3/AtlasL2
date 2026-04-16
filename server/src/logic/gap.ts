import { computeReach } from './reach';
import { toSignificantFigures } from '../utils';

import type { GapRequest, GapResponse } from '@atlasl2/shared';
import type { AppData } from '../types';


export function buildGapResponse(dataStore: AppData, body: GapRequest): GapResponse {
  const excludedLangs = new Set(body.currentLangs);
  const limit = body.limit ?? 5;
  const baseReach = computeReach(dataStore, body.currentLangs, body.targets).globalIndex;
  const selectedTargets = body.targets.length > 0 
    ? body.targets
    : Object.keys(dataStore.countryMetadata);
  const scopePopulation = selectedTargets.reduce((sum, target) => {
    const country = dataStore.countryMetadata[target];
    return sum + (country?.population ?? 0);
  }, 0);

  return Object.values(dataStore.languageMetadata)
    .filter((language) => !excludedLangs.has(language.id))
    .map((language) => {
      const potentialReach = computeReach(
        dataStore,
        [...body.currentLangs, language.id],
        body.targets
      ).globalIndex;

      const marginalGain = Math.max(0, potentialReach - baseReach);

      return {
        lang: language.id,
        potentialReach,
        marginalGain,
        estimatedPopulationGain: toSignificantFigures(
          scopePopulation * marginalGain
        ),
      };
    })
    .filter(recommendation => recommendation.marginalGain > 0)
    .sort((left, right) => {
      if (right.marginalGain !== left.marginalGain) {
        return right.marginalGain - left.marginalGain;
      }
      return right.potentialReach - left.potentialReach;
    })
    .slice(0, limit);
}
