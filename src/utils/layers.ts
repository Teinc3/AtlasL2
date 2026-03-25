import mockLinguisticProfiles from "../api";

import type { Feature, Geometry } from 'geojson';
import type CountryFeatureProperties from "../types/geojson.types";


export function getCommunicabilityColor(feature: Feature<Geometry, CountryFeatureProperties>): [number, number, number, number] {
  const iso3 = feature.properties?.ISO_A3;
  const profile = iso3 ? mockLinguisticProfiles[iso3] : undefined;

  if (!profile) {
    return [0, 0, 0, 0];
  }

  const red = Math.round(255 * (1 - profile.communicabilityIndex));
  const green = Math.round(255 * profile.communicabilityIndex);

  return [red, green, 0, 160];
}

export function getLogElevation(feature: Feature<Geometry, CountryFeatureProperties>): number {
  const iso3 = feature.properties?.ISO_A3;
  const profile = iso3 ? mockLinguisticProfiles[iso3] : undefined;
  const population = profile?.totalPopulation ?? 0;

  if (population <= 0) {
    return 0;
  }

  // Use Log scale
  return Math.max(0, (Math.log10(population) - 5) * 80000);
}
