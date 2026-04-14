import type { Feature, Geometry } from 'geojson';
import type { CountryMetadataMap, ReachResponse } from '@atlasl2/shared';
import type CountryFeatureProperties from "../types/geojson.types";


function getPopulationHeight(population: number): number {
  const T1_CAP = 10_000_000;
  const T2_CAP = 100_000_000;
  const T1_MAX_HEIGHT = 10_000;
  const T2_MAX_HEIGHT = 50_000;
  const TIER_3_POW_FACTOR = 0.6;
  const TIER_3_NORM_FACTOR = 5;
  const TOTAL_HEIGHT_NORM_FACTOR = 3;

  if (population <= 0) {
    return 0;
  }

  let elevationValue: number;

  if (population <= T1_CAP) {
    elevationValue = (population / T1_CAP) * T1_MAX_HEIGHT;
  } else if (population <= T2_CAP) {
    const tier2Range = T2_CAP - T1_CAP;
    const tier2HeightRange = T2_MAX_HEIGHT - T1_MAX_HEIGHT;
    const excessPop = population - T1_CAP;
    elevationValue = T1_MAX_HEIGHT + (excessPop * tier2HeightRange) / tier2Range;
  } else {
    const excessPop = population - T2_CAP;
    elevationValue = T2_MAX_HEIGHT + Math.pow(excessPop, TIER_3_POW_FACTOR) / TIER_3_NORM_FACTOR;
  }

  return elevationValue * TOTAL_HEIGHT_NORM_FACTOR;
}


export function getCommunicabilityColor(
  feature: Feature<Geometry, CountryFeatureProperties>,
  reach: ReachResponse | null,
  selectedCountries: string[] = []
): [number, number, number, number] {
  const countryID = feature.properties?.ADM0_A3;
  const communicabilityIndex = countryID ? reach?.breakdown[countryID]?.score : undefined;

  if (communicabilityIndex === undefined) {
    return countryID && reach === null && selectedCountries.includes(countryID)
      ? [255, 255, 255, 150]
      : [0, 0, 0, 0];
  }

  // piecewise 10H for better saturation
  const red = Math.round(255 * Math.min(1, 2 * (1 - communicabilityIndex)));
  const green = Math.round(255 * Math.min(1, 2 * communicabilityIndex));

  return [red, green, 0, 160];
}

export function getElevation(
  feature: Feature<Geometry, CountryFeatureProperties>,
  countryMetadata: CountryMetadataMap,
  reach: ReachResponse | null,
  selectedCountries: string[] = []
): number {
  const countryID = feature.properties?.ADM0_A3;
  const population = countryID ? countryMetadata[countryID]?.population ?? 0 : 0;
  const communicabilityIndex = countryID ? reach?.breakdown[countryID]?.score : undefined;

  if (communicabilityIndex === undefined) {
    return countryID && reach === null && selectedCountries.includes(countryID)
      ? getPopulationHeight(population)
      : 0;
  }

  return getPopulationHeight(population * communicabilityIndex);
}
