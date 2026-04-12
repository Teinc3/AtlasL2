import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CommunicativeMode } from '@atlasl2/shared';
import { fetchExplore, fetchGap, fetchReach } from '../api';

import type { ExploreResponse, GapResponse, ReachResponse } from '@atlasl2/shared';


export default function useIndices(
	selectedLanguages: string[],
	selectedCountries: string[],
	options?: Partial<{
		mode: CommunicativeMode;
		debounceMs: number;
	}>
) {
	const mode = options?.mode ?? CommunicativeMode.Active;
	const debounceMs = options?.debounceMs ?? 600;

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

	const getAdaptiveDebounceMs = useCallback(() => {
		const now = Date.now();
		const windowMs = 5000;
		const recentChanges = changeTimesRef.current.filter(timestamp => now - timestamp < windowMs);
		recentChanges.push(now);
		changeTimesRef.current = recentChanges;

		if (recentChanges.length <= 3) {
			return 0;
		} else if (recentChanges.length <= 6) {
      return debounceMs / 2;
    } else {
      return debounceMs;
    }
	}, [debounceMs]);

	const loadIndices = useCallback(async (signal: AbortSignal) => {
		const hasLanguages = languageIds.length > 0;
		const hasCountries = countryIds.length > 0;

		if (!hasLanguages && !hasCountries) {
			setReach(null);
			setGap(null);
			setExplore(null);
			setReachError(null);
			setGapError(null);
			setExploreError(null);
			setIsLoadingReach(false);
			setIsLoadingGap(false);
			setIsLoadingExplore(false);
			return;
		}

		const requestId = ++requestIdRef.current;
		setIsLoadingReach(hasLanguages);
		setIsLoadingGap(hasLanguages);
		setIsLoadingExplore(hasCountries && !hasLanguages);
		setReachError(null);
		setGapError(null);
		setExploreError(null);

		if (!hasLanguages) {
			setReach(null);
			setGap(null);
		}

		if (!hasCountries) {
			setExplore(null);
		}

		try {
			const [reachResult, gapResult, exploreResult] = await Promise.allSettled([
				hasLanguages
					? fetchReach({ languages: languageIds, targets: countryIds, mode }, { signal })
					: Promise.resolve(null),
				hasLanguages
					? fetchGap({ currentLangs: languageIds, targets: countryIds }, { signal })
					: Promise.resolve(null),
				(hasCountries && !hasLanguages)
					? fetchExplore(countryIds, { signal })
					: Promise.resolve(null),
			]);

			if (signal.aborted || requestId !== requestIdRef.current) {
				return;
			}

			if (hasLanguages && reachResult.status === 'fulfilled' && reachResult.value) {
				setReach(reachResult.value);
			} else if (hasLanguages && reachResult.status === 'rejected') {
				setReachError(reachResult.reason instanceof Error ? reachResult.reason.message : 'Failed to load reach data');
			}

			if (hasLanguages && gapResult.status === 'fulfilled' && gapResult.value) {
				setGap(gapResult.value);
			} else if (hasLanguages && gapResult.status === 'rejected') {
				setGapError(gapResult.reason instanceof Error ? gapResult.reason.message : 'Failed to load gap data');
			}

			if (hasCountries && !hasLanguages && exploreResult.status === 'fulfilled' && exploreResult.value) {
				setExplore(exploreResult.value);
			} else if (hasCountries && !hasLanguages && exploreResult.status === 'rejected') {
				setExploreError(exploreResult.reason instanceof Error ? exploreResult.reason.message : 'Failed to load explore data');
			}
		} finally {
			if (!signal.aborted && requestId === requestIdRef.current) {
				setIsLoadingReach(false);
				setIsLoadingGap(false);
				setIsLoadingExplore(false);
			}
		}
	}, [languageIds, countryIds, mode]);

	useEffect(() => {
		if (languageIds.length > 0 || countryIds.length > 0) {
			// Mark loading immediately when a new request cycle begins (including debounce period)
			if (languageIds.length > 0) {
				setIsLoadingReach(true);
				setIsLoadingGap(true);
			}
			if (countryIds.length > 0 && languageIds.length === 0) {
				setIsLoadingExplore(true);
			}
		}

		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			void loadIndices(controller.signal);
		}, getAdaptiveDebounceMs());

		return () => {
			controller.abort();
			clearTimeout(timeoutId);
		};
	}, [requestKey, loadIndices, languageIds.length, countryIds.length, getAdaptiveDebounceMs]);

	const refetchReach = useCallback(async () => {
		const controller = new AbortController();
		await loadIndices(controller.signal);
	}, [loadIndices]);

	const refetchGap = useCallback(async () => {
		const controller = new AbortController();
		await loadIndices(controller.signal);
	}, [loadIndices]);

	return {
		reach, gap, explore,
		isLoadingReach, isLoadingGap, isLoadingExplore,
		reachError, gapError, exploreError,
		refetchReach, refetchGap
	};
}
