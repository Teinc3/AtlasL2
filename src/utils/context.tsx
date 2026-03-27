import { createContext, useContext, useState, ReactNode } from 'react';

import type { AtlasContextType } from '../types';


const AtlasContext = createContext<AtlasContextType | undefined>(undefined);


export function AtlasProvider({ children }: { children: ReactNode }) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English"]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["France", "Germany"]);
  const [focusedCountryId, setFocusedCountryId] = useState<string | null>(null);

  const addLanguage = (lang: string) => {
    if (!selectedLanguages.includes(lang)) {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };
  
  const removeLanguage = (lang: string) => {
    setSelectedLanguages(prev => prev.filter(l => l !== lang));
  };

  const addCountry = (country: string) => {
    if (!selectedCountries.includes(country)) {
      setSelectedCountries([...selectedCountries, country]);
    }
  };
  
  const removeCountry = (country: string) => {
    setSelectedCountries(prev => prev.filter(c => c !== country));
  };

  return (
    <AtlasContext.Provider value={{
      selectedLanguages, addLanguage, removeLanguage,
      selectedCountries, addCountry, removeCountry,
      focusedCountryId, setFocusedCountryId
    }}>
      {children}
    </AtlasContext.Provider>
  );
}


export default function useAtlasContext() {
  const context = useContext(AtlasContext);
  if (context === undefined) {
    throw new Error("useAtlasContext must be used within an AtlasProvider");
  }
  return context;
}
