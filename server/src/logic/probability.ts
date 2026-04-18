import { CommunicativeMode } from '@atlasl2/shared';
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
  languages: ReachRequest['languages'],
  mode: CommunicativeMode
): number {
  const country = dataStore.countryMetadata[countryCode];
  if (!country) {
    return 0;
  }

  const countryLangMap = dataStore.combinedData.countries[countryCode] ?? {};
  const probabilities = Object.entries(countryLangMap).map(([languageCode, speakers]) => {
    // For each language in the country
    // First check if the language itself is selected
    if (languages.includes(languageCode)) {
      return normalizePrevalence(speakers, country.population);
    }
    
    if (mode !== CommunicativeMode.None) {
      // if not, check all related languages of that language
      // And find the language in relationmap that we have selected that has the highest score
      const relatedLanguages = dataStore.relationMap[languageCode] ?? {};
      const relatedLangScores = Object.entries(relatedLanguages)
        .filter(([relatedLang]) => languages.includes(relatedLang))
        .map(([relatedLang, score]) => {
          // Score is the UPSTREAM weight (So return if Broadcast)
          // Lookup the DOWNSTREAM weight for the same language pair (if Active or Reception)
          if (mode === CommunicativeMode.Broadcast) {
            return score;
          }
          const downstreamScore = dataStore.relationMap[relatedLang]?.[languageCode] ?? 0;
          if (mode === CommunicativeMode.Active) {
            return Math.min(score, downstreamScore);
          } else {
            return downstreamScore;
          }
        });

      if (relatedLangScores.length > 0) {
        const maxLangRelation = Math.max(...relatedLangScores);
        return normalizePrevalence(speakers, country.population, maxLangRelation);
      }
    }

    // No relation, return 0
    return 0;
  });

  return calculateIndependentReach(probabilities);
}
