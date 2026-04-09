export interface GDPMetadata<T = number | null> {
  nominal: T;
  ppp: T;
  per_capita_nominal: T;
  per_capita_ppp: T;
}

export interface CountryOfficialScript {
  iso3: string;
  primary_script: string | null;
}

export interface CountryMetadata {
  id: string;
  name: string;
  flag: string;
  region: string;
  population: number;
  gdp: GDPMetadata;
  official_scripts: CountryOfficialScript[];
}

export type CountryMetadataMap = Record<string, CountryMetadata>;

export interface WorldBankCountryRow {
  id: string;
  countryName: string;
  population: number;
  gdp: GDPMetadata;
}
