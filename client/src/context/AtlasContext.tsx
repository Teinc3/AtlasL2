import {
	createContext, useCallback, useContext, useState,
	type ReactNode
} from 'react';

import { useIndices, useMetadata } from '../hooks';

import type { AtlasContextType } from '../types';


const AtlasContext = createContext<AtlasContextType | undefined>(undefined);


export function AtlasProvider({ children }: { children: ReactNode }) {
	const {
		countryMetadata,
		languageMetadata,
		isLoading: metadataLoading,
		error: metadataError,
	} = useMetadata();

	const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);
	const [selectedCountries, setSelectedCountries] = useState<string[]>(['Germany']);
	const [focusedCountryId, setFocusedCountryId] = useState<string | null>(null);

	const [isSelectPanelOpen, setIsSelectPanelOpen] = useState<boolean>(true);
	const [isInfoPanelOpen, setIsInfoPanelOpen] = useState<boolean>(false);

	const {
		reach, gap,
		isLoadingReach: reachLoading,
		isLoadingGap: gapLoading,
		reachError, gapError,
	} = useIndices(selectedLanguages, selectedCountries, languageMetadata, countryMetadata);

	const addLanguage = useCallback((lang: string) => {
		setSelectedLanguages((prevLangs) => {
			if (!prevLangs.includes(lang)) {
				if (prevLangs.length === 0) {
					setIsSelectPanelOpen(true);
					setIsInfoPanelOpen(true);
				}
				return [...prevLangs, lang];
			}
			return prevLangs;
		});
	}, []);

	const removeLanguage = useCallback((lang: string) => {
		setSelectedLanguages((prev) => prev.filter((language) => language !== lang));
	}, []);

	const addCountry = useCallback((country: string) => {
		setSelectedCountries((prevCountries) => {
			if (!prevCountries.includes(country)) {
				if (prevCountries.length === 0) {
					setIsSelectPanelOpen(true);
					setIsInfoPanelOpen(true);
				}
				return [...prevCountries, country];
			}
			return prevCountries;
		});
	}, []);

	const removeCountry = useCallback((country: string) => {
		setSelectedCountries((prev) => prev.filter((selectedCountry) => selectedCountry !== country));
	}, []);

	const handleSetSelectedCountries = useCallback((countries: string[]) => {
		setSelectedCountries((prevCountries) => {
			if (countries.length > 0 && prevCountries.length === 0) {
				setIsSelectPanelOpen(true);
				setIsInfoPanelOpen(true);
			}
			return countries;
		});
	}, []);

	return (
		<AtlasContext.Provider
			value={{
				selectedLanguages,
				addLanguage,
				removeLanguage,
				selectedCountries,
				setSelectedCountries: handleSetSelectedCountries,
				addCountry,
				removeCountry,
				focusedCountryId,
				setFocusedCountryId,
				countryMetadata,
				languageMetadata,
				metadataLoading,
				metadataError,
				reach,
				gap,
				reachLoading,
				gapLoading,
				reachError,
				gapError,
				isSelectPanelOpen,
				setIsSelectPanelOpen,
				isInfoPanelOpen,
				setIsInfoPanelOpen,
			}}
		>
			{children}
		</AtlasContext.Provider>
	);
}

export default function useAtlasContext() {
	const context = useContext(AtlasContext);
	if (context === undefined) {
		throw new Error('useAtlasContext must be used within an AtlasProvider');
	}
	return context;
}
