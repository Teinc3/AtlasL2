export default interface AtlasContextType {
  // Data selections
  selectedLanguages: string[];
  addLanguage: (lang: string) => void;
  removeLanguage: (lang: string) => void;
  
  selectedCountries: string[];
  addCountry: (country: string) => void;
  removeCountry: (country: string) => void;

  // Active focus
  focusedCountryId: string | null;
  setFocusedCountryId: (id: string | null) => void;
}
