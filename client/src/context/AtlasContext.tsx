import {
	createContext, useCallback, useContext, useState,
	type ReactNode
} from 'react';
import { CommunicativeMode } from '@atlasl2/shared';

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

	const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
	const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
	const [focusedCountryId, setFocusedCountryId] = useState<string | null>(null);
	const [mutualIntelligibilityMode, setMutualIntelligibilityMode]
    = useState<CommunicativeMode>(CommunicativeMode.None);

	const [isSelectPanelOpen, setIsSelectPanelOpen] = useState<boolean>(true);
	const [isInfoPanelOpen, setIsInfoPanelOpen] = useState<boolean>(false);

	const {
		reach, gap, explore,
		isLoading: indicesLoading,
		error: indicesError,
	} = useIndices(selectedLanguages, selectedCountries, mutualIntelligibilityMode);

	const loading = {
		metadata: metadataLoading,
		reach: indicesLoading.reach,
		gap: indicesLoading.gap,
		explore: indicesLoading.explore,
	};

	const error = metadataError || indicesError;

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
		setSelectedCountries((prev) => {
			const next = prev.filter((selectedCountry) => selectedCountry !== country);
			setFocusedCountryId((focused) => (focused === country ? (next[0] ?? null) : focused));
			return next;
		});
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
				selectedLanguages, selectedCountries,
				setSelectedCountries: handleSetSelectedCountries,
				addLanguage, removeLanguage,
				mutualIntelligibilityMode,
				setMutualIntelligibilityMode,
				addCountry, removeCountry,
				focusedCountryId,
				setFocusedCountryId,
				countryMetadata, languageMetadata,
				reach, gap, explore,
				loading,
				error,
				isSelectPanelOpen, isInfoPanelOpen,
				setIsSelectPanelOpen, setIsInfoPanelOpen,
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
