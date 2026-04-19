import { CommunicativeMode } from '@atlasl2/shared';
import { computeReach } from './reach';
import { toSigFig } from '../utils';

import type { GapRequest, GapResponse } from '@atlasl2/shared';
import type { AppData } from '../types';


export default function buildGapResponse(dataStore: AppData, body: GapRequest): GapResponse {
  const excludedLangs = new Set(body.currentLangs);
  const candidateLangs = new Set<string>();

  const selectedTargets = body.targets.length > 0 
    ? body.targets
    : Object.keys(dataStore.countryMetadata);

  const baseReach = computeReach(
    dataStore, body.currentLangs, body.targets, body.mode
  ).globalIndex;
  
  const scopePopulation = selectedTargets.reduce((sum, target) => {
    const country = dataStore.countryMetadata[target];
    return sum + (country?.population ?? 0);
  }, 0);

  for (const target of selectedTargets) {
    const countryLangMap = dataStore.combinedData.countries[target] ?? {};
    
    for (const baseLang of Object.keys(countryLangMap)) {
      // First add the base language itself
      candidateLangs.add(baseLang);
      
      // If mutual intelligibility mode is not None, also add other related languages
      if (body.mode !== CommunicativeMode.None) {
        const sources = Object.keys(dataStore.relationMap[baseLang] ?? {});
        for (const src of sources) {
          candidateLangs.add(src);
        }
      }
    }
  }

  excludedLangs.forEach(lang => candidateLangs.delete(lang));

  return Array.from(candidateLangs).map(lang => {
    const potentialReach = computeReach(
      dataStore,
      [...body.currentLangs, lang], // Include this language
      body.targets,
      body.mode
    ).globalIndex;

    const marginalGain = Math.max(0, potentialReach - baseReach);
    return {
      lang,
      potentialReach,
      marginalGain,
      estimatedPopulationGain: toSigFig(scopePopulation * marginalGain),
    };

  }).filter(recommendation => recommendation.marginalGain > 0)
    .sort((left, right) => {
      if (right.marginalGain !== left.marginalGain) {
        return right.marginalGain - left.marginalGain;
      }
      return right.potentialReach - left.potentialReach;
    })
    .slice(0, 5);
}
