import type { LinguisticProfile } from "../types";


const mockLinguisticProfiles: Record<string, LinguisticProfile> = {
  "FRA": {
    iso3: "FRA",
    countryName: "France",
    totalPopulation: 67000000,
    communicabilityIndex: 0.65,
    topLanguages: ["French", "English", "Spanish"]
  },
  "DEU": {
    iso3: "DEU",
    countryName: "Germany",
    totalPopulation: 83000000,
    communicabilityIndex: 0.8,
    topLanguages: ["German", "English"]
  },
  "NGA": {
    iso3: "NGA",
    countryName: "Nigeria",
    totalPopulation: 213000000,
    communicabilityIndex: 0.5,
    topLanguages: ["English", "Hausa", "Yoruba"]
  }
}


export default mockLinguisticProfiles;
