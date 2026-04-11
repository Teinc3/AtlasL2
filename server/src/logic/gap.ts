import { computeReach } from './reach';

import type { GapRequest, GapResponse } from '@atlasl2/shared';
import type { AppData } from '../types';


export function buildGapResponse(dataStore: AppData, body: GapRequest): GapResponse {
  const excludedLangs = new Set(body.currentLangs);
  const limit = body.limit ?? 5;
  const baseReach = computeReach(dataStore, body.currentLangs, body.targets).globalIndex;

  return Object.values(dataStore.languageMetadata)
    .filter((language) => !excludedLangs.has(language.id))
    .map((language) => {
      const potentialReach = computeReach(
        dataStore,
        [...body.currentLangs, language.id],
        body.targets
      ).globalIndex;

      return {
        lang: language.id,
        potentialReach,
        marginalGain: potentialReach - baseReach,
      };
    })
    .sort((left, right) => {
      if (right.marginalGain !== left.marginalGain) {
        return right.marginalGain - left.marginalGain;
      }
      return right.potentialReach - left.potentialReach;
    })
    .slice(0, limit);
}
