import type { Feature, Geometry } from 'geojson';
import type { CountryMetadataMap, ReachResponse } from '@atlasl2/shared';
import type CountryFeatureProperties from "../types/geojson.types";


export function getCommunicabilityColor(
  feature: Feature<Geometry, CountryFeatureProperties>,
  reach: ReachResponse | null
): [number, number, number, number] {
  const countryID = feature.properties?.ADM0_A3;
  const communicabilityIndex = countryID ? reach?.breakdown[countryID] : undefined;

  if (communicabilityIndex === undefined) {
    return [0, 0, 0, 0];
  }

  // piecewise 10H for better saturation
  const red = Math.round(255 * Math.min(1, 2 * (1 - communicabilityIndex)));
  const green = Math.round(255 * Math.min(1, 2 * communicabilityIndex));

  return [red, green, 0, 160];
}

export function getElevation(
  feature: Feature<Geometry, CountryFeatureProperties>,
  countryMetadata: CountryMetadataMap,
  reach: ReachResponse | null
): number {
  const countryID = feature.properties?.ADM0_A3;
  const population = countryID ? countryMetadata[countryID]?.population ?? 0 : 0;
  const communicabilityIndex = countryID ? reach?.breakdown[countryID] : undefined;

  if (population <= 0 || communicabilityIndex === undefined) {
    return 0;
  }

  const communicablePop = population * communicabilityIndex;
  
  // The Logarithmic Anchors
  const T1_CAP = 10_000_000;
  const T2_CAP = 100_000_000;
  const T1_MAX_HEIGHT = 10_000;
  const T2_MAX_HEIGHT = 50_000;
  const TIER_3_POW_FACTOR = 0.6;
  const TIER_3_NORM_FACTOR = 5;
  const TOTAL_HEIGHT_NORM_FACTOR = 3;
  
  let elevationValue: number;

  if (communicablePop <= T1_CAP) {
    // Tier 1: Linear (0 to 10M -> 0 to 10k)
    elevationValue = (communicablePop / T1_CAP) * T1_MAX_HEIGHT;
    
  } else if (communicablePop <= T2_CAP) {
    // Tier 2: Linear (10M to 100M -> 10k to 40k)
    const tier2Range = T2_CAP - T1_CAP;
    const tier2HeightRange = T2_MAX_HEIGHT - T1_MAX_HEIGHT;
    
    const excessPop = (communicablePop - T1_CAP);
    const tier2Height = excessPop * tier2HeightRange / tier2Range
    
    elevationValue = T1_MAX_HEIGHT + tier2Height;
    
  } else {
    // Tier 3: Compressed to 100M+
    // sqrt the excess to anchor chichi and india 
    const excessPop = communicablePop - T2_CAP;
    elevationValue = T2_MAX_HEIGHT + Math.pow(excessPop, TIER_3_POW_FACTOR) / TIER_3_NORM_FACTOR; 
  }

  return elevationValue * TOTAL_HEIGHT_NORM_FACTOR; 
}
