import type { LinguisticProfile } from "../types";


const mockLinguisticProfiles: Record<string, LinguisticProfile> = {
  "FRA": {
    iso3: "FRA",
    countryName: "France",
    totalPopulation: 67000000,
    communicabilityIndex: 0.6,
    topLanguages: ["French", "English", "Spanish"]
  },
  "DEU": {
    iso3: "DEU",
    countryName: "Germany",
    totalPopulation: 83000000,
    communicabilityIndex: 0.75,
    topLanguages: ["German", "English"]
  },
  "NGA": {
    iso3: "NGA",
    countryName: "Nigeria",
    totalPopulation: 213000000,
    communicabilityIndex: 0.55,
    topLanguages: ["English", "Hausa", "Yoruba"]
  },
  "RUS": {
    iso3: "RUS",
    countryName: "Russia",
    totalPopulation: 144000000,
    communicabilityIndex: 0.25,
    topLanguages: ["Russian", "English", "Tatar"]
  },
  "CHN": {
    iso3: "CHN",
    countryName: "China",
    totalPopulation: 1412000000,
    communicabilityIndex: 0.18,
    topLanguages: ["Mandarin", "Cantonese", "English"]
  },
  "IND": {
    iso3: "IND",
    countryName: "India",
    totalPopulation: 1408000000,
    communicabilityIndex: 0.7, 
    topLanguages: ["Hindi", "English", "Bengali"]
  },
  "USA": {
    iso3: "USA",
    countryName: "United States",
    totalPopulation: 331000000,
    communicabilityIndex: 0.95,
    topLanguages: ["English", "Spanish", "Chinese"]
  },
  "CHE": {
    iso3: "CHE",
    countryName: "Switzerland",
    totalPopulation: 8700000,
    communicabilityIndex: 0.8,
    topLanguages: ["German", "French", "Italian", "English"]
  },
  "LUX": {
    iso3: "LUX",
    countryName: "Luxembourg",
    totalPopulation: 650000,
    communicabilityIndex: 0.8,
    topLanguages: ["Luxembourgish", "French", "German", "English"]
  }
}


export default mockLinguisticProfiles;
