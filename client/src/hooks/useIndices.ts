import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CommunicativeMode } from '@atlasl2/shared';
import { fetchExplore, fetchGap, fetchReach } from '../api';

import type { ExploreResponse, GapResponse, ReachResponse } from '@atlasl2/shared';
import type { EndpointLifecycle } from '../types';


const ADAPTIVE_WINDOW_MS = 5000;
const DEBOUNCE_MS = 600;
const IMMEDIATE_CHANGES = 3;
const HALF_DEBOUNCE_CHANGES = 6;


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
	const [isLoadingReach, setIsLoadingReach] = useState(false);
	const [isLoadingGap, setIsLoadingGap] = useState(false);
	const [isLoadingExplore, setIsLoadingExplore] = useState(false);
	const [reachError, setReachError] = useState<string | null>(null);
	const [gapError, setGapError] = useState<string | null>(null);
	const [exploreError, setExploreError] = useState<string | null>(null);
	const requestIdRef = useRef(0);
	const changeTimesRef = useRef<number[]>([]);
	const languageIds = useMemo(() => selectedLanguages, [selectedLanguages]);
	const countryIds = useMemo(() => selectedCountries, [selectedCountries]);
	const requestKey = useMemo(
		() => `${languageIds.join('|')}::${countryIds.join('|')}::${mode}`,
		[languageIds, countryIds, mode]
	);
	const resetAllState = useCallback(() => {
		setReach(null);
		setGap(null);
		setExplore(null);
		setReachError(null);
		setGapError(null);
		setExploreError(null);
		setIsLoadingReach(false);
		setIsLoadingGap(false);
		setIsLoadingExplore(false);
	}, []);
	const setInitialLoadingAndErrors = useCallback((hasLanguages: boolean, hasExplore: boolean) => {
		setIsLoadingReach(hasLanguages);
		setIsLoadingGap(hasLanguages);
		setIsLoadingExplore(hasExplore);
		setReachError(null);
		setGapError(null);
		setExploreError(null);
	}, []);
	const setLoadingForDebounceWindow = useCallback((hasLanguages: boolean, hasExplore: boolean) => {
		if (hasLanguages) {
			setIsLoadingReach(true);
			setIsLoadingGap(true);
		}
		if (hasExplore) {
			setIsLoadingExplore(true);
		}
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
	}, [DEBOUNCE_MS]);

	const loadIndices = useCallback(async (signal: AbortSignal) => {
		const hasLanguages = languageIds.length > 0;
		const hasCountries = countryIds.length > 0;
		const hasExplore = hasLanguages || hasCountries;

		if (!hasExplore) {
			resetAllState();
			return;
		}

		const requestId = ++requestIdRef.current;
		setInitialLoadingAndErrors(hasLanguages, hasExplore);

		if (!hasLanguages) {
			setReach(null);
			setGap(null);
		}

		try {
			const [reachResult, gapResult, exploreResult] = await Promise.allSettled([
				hasLanguages
					? fetchReach({ languages: languageIds, targets: countryIds, mode }, { signal })
					: Promise.resolve(null),
				hasLanguages
					? fetchGap({ currentLangs: languageIds, targets: countryIds }, { signal })
					: Promise.resolve(null),
				hasExplore
					? fetchExplore({
						countries: countryIds,
						...(hasLanguages ? { languages: languageIds } : {}),
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
				setError: setReachError,
				errorFallback: 'Failed to load reach data',
			});

			applyEndpointLifecycle({
				enabled: hasLanguages,
				result: gapResult,
				setValue: setGap,
				setError: setGapError,
				errorFallback: 'Failed to load gap data',
			});

			applyEndpointLifecycle({
				enabled: hasExplore,
				result: exploreResult,
				setValue: setExplore,
				setError: setExploreError,
				errorFallback: 'Failed to load explore data',
			});
		} finally {
			if (!signal.aborted && requestId === requestIdRef.current) {
				setIsLoadingReach(false);
				setIsLoadingGap(false);
				setIsLoadingExplore(false);
			}
		}
	}, [languageIds, countryIds, mode, resetAllState, setInitialLoadingAndErrors]);

	useEffect(() => {
		const hasLanguages = languageIds.length > 0;
		const hasExplore = hasLanguages || countryIds.length > 0;

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
	}, [requestKey, loadIndices, languageIds, countryIds, getAdaptiveDebounceMs, setLoadingForDebounceWindow]);

	const refetch = useCallback(async () => {
		const controller = new AbortController();
		await loadIndices(controller.signal);
	}, [loadIndices]);

	return {
		reach, gap, explore,
		isLoadingReach, isLoadingGap, isLoadingExplore,
		reachError, gapError, exploreError,
		refetchReach: refetch,
		refetchGap: refetch,
	};
}
