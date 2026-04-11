import { useCallback, useEffect, useState } from 'react';

import { fetchCountryMetadata, fetchLanguageMetadata } from '../api/endpoints';

import type { CountryMetadataMap, LanguageMetadataMap } from '@atlasl2/shared';


export default function useMetadata() {
	const [countryMetadata, setCountryMetadata] = useState<CountryMetadataMap>({});
	const [languageMetadata, setLanguageMetadata] = useState<LanguageMetadataMap>({});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadMetadata = useCallback(async (signal?: AbortSignal) => {
		setIsLoading(true);
		setError(null);

		try {
			const [countries, languages] = await Promise.all([
				fetchCountryMetadata({ signal }),
				fetchLanguageMetadata({ signal }),
			]);

			if (signal?.aborted) {
				return;
			}

			setCountryMetadata(countries);
			setLanguageMetadata(languages);
		} catch (loadError) {
			if (signal?.aborted) {
				return;
			}

			setError(loadError instanceof Error ? loadError.message : 'Failed to load metadata');
		} finally {
			if (!signal?.aborted) {
				setIsLoading(false);
			}
		}
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		void loadMetadata(controller.signal);
		return () => controller.abort();
	}, [loadMetadata]);

	const refetch = useCallback(async () => {
		const controller = new AbortController();
		await loadMetadata(controller.signal);
	}, [loadMetadata]);

	return {
		countryMetadata,
		languageMetadata,
		isLoading,
		error,
		refetch,
	};
}
