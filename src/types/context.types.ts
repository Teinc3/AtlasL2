export default interface AtlasContextType {
  selectedLanguages: string[];
  addLanguage: (lang: string) => void;
  removeLanguage: (lang: string) => void;
  
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
}
