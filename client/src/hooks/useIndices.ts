import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CommunicativeMode } from '@atlasl2/shared';
import { fetchGap, fetchReach } from '../api';

import type { 
  GapResponse, ReachResponse
} from '@atlasl2/shared';


export default function useIndices(
	selectedLanguages: string[],
	selectedCountries: string[],
	options?: Partial<{
		mode: CommunicativeMode;
		debounceMs: number;
	}>
) {
	const mode = options?.mode ?? CommunicativeMode.Active;
	const debounceMs = options?.debounceMs ?? 400;

	const [reach, setReach] = useState<ReachResponse | null>(null);
	const [gap, setGap] = useState<GapResponse | null>(null);
	const [isLoadingReach, setIsLoadingReach] = useState(false);
	const [isLoadingGap, setIsLoadingGap] = useState(false);
	const [reachError, setReachError] = useState<string | null>(null);
	const [gapError, setGapError] = useState<string | null>(null);
	const requestIdRef = useRef(0);
	const languageIds = useMemo(() => selectedLanguages, [selectedLanguages]);
	const countryIds = useMemo(() => selectedCountries, [selectedCountries]);
	const requestKey = useMemo(
		() => `${languageIds.join('|')}::${countryIds.join('|')}::${mode}`,
		[languageIds, countryIds, mode]
	);

	const loadIndices = useCallback(async (signal: AbortSignal) => {
		if (languageIds.length === 0) {
			setReach(null);
			setGap(null);
			setReachError(null);
			setGapError(null);
			setIsLoadingReach(false);
			setIsLoadingGap(false);
			return;
		}

		const requestId = ++requestIdRef.current;
		setIsLoadingReach(true);
		setIsLoadingGap(true);
		setReachError(null);
		setGapError(null);

		try {
			const [reachResult, gapResult] = await Promise.allSettled([
				fetchReach({ languages: languageIds, targets: countryIds, mode }, { signal }),
				fetchGap({ currentLangs: languageIds, targets: countryIds }, { signal }),
			]);

			if (signal.aborted || requestId !== requestIdRef.current) {
				return;
			}

			if (reachResult.status === 'fulfilled') {
				setReach(reachResult.value);
			} else {
				setReachError(reachResult.reason instanceof Error ? reachResult.reason.message : 'Failed to load reach data');
			}

			if (gapResult.status === 'fulfilled') {
				setGap(gapResult.value);
			} else {
				setGapError(gapResult.reason instanceof Error ? gapResult.reason.message : 'Failed to load gap data');
			}
		} finally {
			if (!signal.aborted && requestId === requestIdRef.current) {
				setIsLoadingReach(false);
				setIsLoadingGap(false);
			}
		}
	}, [languageIds, countryIds, mode]);

	useEffect(() => {
		if (languageIds.length > 0) {
			// Mark loading immediately when a new request cycle begins (including debounce period)
			setIsLoadingReach(true);
			setIsLoadingGap(true);
		}

		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			void loadIndices(controller.signal);
		}, debounceMs);

		return () => {
			controller.abort();
			clearTimeout(timeoutId);
		};
	}, [requestKey, debounceMs, loadIndices, languageIds.length]);

	const refetchReach = useCallback(async () => {
		const controller = new AbortController();
		await loadIndices(controller.signal);
	}, [loadIndices]);

	const refetchGap = useCallback(async () => {
		const controller = new AbortController();
		await loadIndices(controller.signal);
	}, [loadIndices]);

	return {
		reach, gap,
		isLoadingReach, isLoadingGap,
		reachError, gapError,
		refetchReach, refetchGap
	};
}
