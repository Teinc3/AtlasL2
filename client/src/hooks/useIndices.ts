import { useCallback, useEffect, useRef, useState } from 'react';

import { CommunicativeMode } from '@atlasl2/shared';
import { fetchExplore, fetchGap, fetchReach } from '../api';

import type { ExploreResponse, GapResponse, ReachResponse } from '@atlasl2/shared';
import type { EndpointLifecycle } from '../types';


const ADAPTIVE_WINDOW_MS = 5000;
const DEBOUNCE_MS = 600;
const IMMEDIATE_CHANGES = 3;
const HALF_DEBOUNCE_CHANGES = 6;
const IDLE_LOADING = {
	reach: false,
	gap: false,
	explore: false,
};


function createLoadingState(hasLanguages: boolean, hasExplore: boolean) {
	return {
		reach: hasLanguages,
		gap: hasLanguages,
		explore: hasExplore,
	};
}

function toErrorMessage(reason: unknown, fallback: string): string {
	return reason instanceof Error ? reason.message : fallback;
}

function applyEndpointLifecycle<T>(config: EndpointLifecycle<T>): void {
	if (!config.enabled) {
		return;
	}

	if (config.result.status === 'fulfilled' && config.result.value) {
		config.setValue(config.result.value);
		return;
	}

	if (config.result.status === 'rejected') {
		config.setError(toErrorMessage(config.result.reason, config.errorFallback));
	}
}


export default function useIndices(
	selectedLanguages: string[],
	selectedCountries: string[],
	mode?: CommunicativeMode
) {
  mode ??= CommunicativeMode.Active;

	const [reach, setReach] = useState<ReachResponse | null>(null);
	const [gap, setGap] = useState<GapResponse | null>(null);
	const [explore, setExplore] = useState<ExploreResponse | null>(null);
	const [isLoading, setIsLoading] = useState(IDLE_LOADING);
	const [error, setError] = useState<string | null>(null);
	const requestIdRef = useRef(0);
	const changeTimesRef = useRef<number[]>([]);
	const requestKey = `${selectedLanguages.join('|')}::${selectedCountries.join('|')}::${mode}`;
	const resetAllState = useCallback(() => {
		setReach(null);
		setGap(null);
		setExplore(null);
		setError(null);
		setIsLoading(IDLE_LOADING);
	}, []);
	const setInitialLoadingAndError = useCallback((hasLanguages: boolean, hasExplore: boolean) => {
		setIsLoading(createLoadingState(hasLanguages, hasExplore));
		setError(null);
	}, []);
	const setLoadingForDebounceWindow = useCallback((hasLanguages: boolean, hasExplore: boolean) => {
		setIsLoading(createLoadingState(hasLanguages, hasExplore));
	}, []);

	const getAdaptiveDebounceMs = useCallback(() => {
		const now = Date.now();
		const recentChanges = changeTimesRef.current.filter(timestamp => now - timestamp < ADAPTIVE_WINDOW_MS);
		recentChanges.push(now);
		changeTimesRef.current = recentChanges;

		if (recentChanges.length <= IMMEDIATE_CHANGES) {
			return 0;
		} else if (recentChanges.length <= HALF_DEBOUNCE_CHANGES) {
      return DEBOUNCE_MS / 2;
    } else {
      return DEBOUNCE_MS;
    }
	}, []);

	const loadIndices = useCallback(async (signal: AbortSignal) => {
		const hasLanguages = selectedLanguages.length > 0;
		const hasCountries = selectedCountries.length > 0;
		const hasExplore = hasLanguages || hasCountries;

		if (!hasExplore) {
			resetAllState();
			return;
		}

		const requestId = ++requestIdRef.current;
		setInitialLoadingAndError(hasLanguages, hasExplore);

		if (!hasLanguages) {
			setReach(null);
			setGap(null);
		}

		try {
			const [reachResult, gapResult, exploreResult] = await Promise.allSettled([
				hasLanguages
					? fetchReach({ languages: selectedLanguages, targets: selectedCountries, mode }, { signal })
					: Promise.resolve(null),
				hasLanguages
					? fetchGap({ currentLangs: selectedLanguages, targets: selectedCountries }, { signal })
					: Promise.resolve(null),
				hasExplore
					? fetchExplore({
						countries: selectedCountries,
						...(hasLanguages ? { languages: selectedLanguages } : {}),
					}, { signal })
					: Promise.resolve(null),
			]);

			if (signal.aborted || requestId !== requestIdRef.current) {
				return;
			}

			applyEndpointLifecycle({
				enabled: hasLanguages,
				result: reachResult,
				setValue: setReach,
				setError: (message) => setError((currentError) => currentError ?? message),
				errorFallback: 'Failed to load reach data',
			});

			applyEndpointLifecycle({
				enabled: hasLanguages,
				result: gapResult,
				setValue: setGap,
				setError: (message) => setError((currentError) => currentError ?? message),
				errorFallback: 'Failed to load gap data',
			});

			applyEndpointLifecycle({
				enabled: hasExplore,
				result: exploreResult,
				setValue: setExplore,
				setError: (message) => setError((currentError) => currentError ?? message),
				errorFallback: 'Failed to load explore data',
			});
		} finally {
			if (!signal.aborted && requestId === requestIdRef.current) {
				setIsLoading(IDLE_LOADING);
			}
		}
	}, [selectedLanguages, selectedCountries, mode, resetAllState, setInitialLoadingAndError]);

	useEffect(() => {
		const hasLanguages = selectedLanguages.length > 0;
		const hasExplore = hasLanguages || selectedCountries.length > 0;

		if (hasExplore) {
			// Mark loading immediately when a new request cycle begins (including debounce period)
			setLoadingForDebounceWindow(hasLanguages, hasExplore);
		}

		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			void loadIndices(controller.signal);
		}, getAdaptiveDebounceMs());

		return () => {
			controller.abort();
			clearTimeout(timeoutId);
		};
	}, [requestKey, loadIndices, selectedLanguages, selectedCountries, getAdaptiveDebounceMs, setLoadingForDebounceWindow]);

	return {
		reach, gap, explore,
		isLoading, error
	};
}
