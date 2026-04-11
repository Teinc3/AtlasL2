import type { CountryMetadataMap, GapResponse, LanguageMetadataMap, ReachResponse } from '@atlasl2/shared';


export default interface AtlasContextType {
  // ISO3 language IDs
  selectedLanguages: string[];
  addLanguage: (lang: string) => void;
  removeLanguage: (lang: string) => void;
  
  // ISO3 country IDs
  selectedCountries: string[];
  setSelectedCountries: (countries: string[]) => void;
  addCountry: (country: string) => void;
  removeCountry: (country: string) => void;

  isSelectPanelOpen: boolean;
  setIsSelectPanelOpen: (isOpen: boolean) => void;
  isInfoPanelOpen: boolean;
  setIsInfoPanelOpen: (isOpen: boolean) => void;

  // Active focus
  focusedCountryId: string | null;
  setFocusedCountryId: (id: string | null) => void;

  // Metadata
  countryMetadata: CountryMetadataMap;
  languageMetadata: LanguageMetadataMap;
  metadataLoading: boolean;
  metadataError: string | null;

  // API indices
  reach: ReachResponse | null;
  gap: GapResponse | null;
  reachLoading: boolean;
  gapLoading: boolean;
  reachError: string | null;
  gapError: string | null;
}
