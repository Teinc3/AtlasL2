export default interface LinguisticProfile {
  iso3: string;
  countryName: string;
  totalPopulation: number;
  communicabilityIndex: number; // 0 to 100 (The PolyUnion math result)
  topLanguages: string[];
}
