import { useCallback, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { useAtlasContext } from '../context';
import { getFeatureBounds } from '../utils';

import type { Feature, Geometry } from 'geojson';
import type { PickingInfo } from '@deck.gl/core';
import type { MapRef } from 'react-map-gl/maplibre';
import type { CountryFeatureProperties, HoverState } from '../types';


export default function useMapInteractions(mapRef: RefObject<MapRef | null>) {
	const {
		selectedCountries,
		addCountry,
		removeCountry,
		setFocusedCountryId,
	} = useAtlasContext();

	const [hoverInfo, setHoverInfo] = useState<HoverState>({
		isVisible: false,
		x: 0,
		y: 0,
		countryId: null,
		isLocked: false,
	});

	const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const currentHoveredCountryRef = useRef<string | null>(null);
	const isMovingRef = useRef<boolean>(false);

	const closeHoverPanel = useCallback(() => {
		setHoverInfo((prev) => ({ ...prev, isVisible: false, isLocked: false, countryId: null }));
		currentHoveredCountryRef.current = null;
		if (hoverTimerRef.current) {
			clearTimeout(hoverTimerRef.current);
		}
	}, []);

	const handleHover = useCallback((info: PickingInfo<Feature<Geometry, CountryFeatureProperties>>) => {
		if (isMovingRef.current) {
			return;
		}

		const { object, x, y } = info;
		const countryId = object?.properties?.ADM0_A3 || null;

		setHoverInfo((prev) => {
			if (prev.isLocked && !countryId) {
				return prev;
			}

			if (countryId !== currentHoveredCountryRef.current) {
				if (hoverTimerRef.current) {
					clearTimeout(hoverTimerRef.current);
				}
				currentHoveredCountryRef.current = countryId;

				if (countryId) {
					hoverTimerRef.current = setTimeout(() => {
						setHoverInfo((state) => ({ ...state, isVisible: true, isLocked: true }));
					}, 1500);
				} else {
					return { ...prev, isVisible: false, countryId: null, isLocked: false };
				}
			}

			if (!prev.isLocked) {
				return { ...prev, x, y, countryId, isVisible: false };
			}

			return prev;
		});
	}, []);

	const handleMapInteractionStart = useCallback(() => {
		isMovingRef.current = true;
		closeHoverPanel();
	}, [closeHoverPanel]);

	const handleMapInteractionEnd = useCallback(() => {
		isMovingRef.current = false;
	}, []);

	const handleClick = useCallback((info: PickingInfo<Feature<Geometry, CountryFeatureProperties>>) => {
		const { object, coordinate } = info;
		const countryId = object?.properties?.ADM0_A3 || null;

		closeHoverPanel();

		if (countryId) {
			const targetCountryID = countryId;
			setFocusedCountryId(countryId);

			if (selectedCountries.includes(targetCountryID)) {
				removeCountry(targetCountryID);
			} else {
				const hadNoCountriesSelected = selectedCountries.length === 0;
				addCountry(targetCountryID);

				if (hadNoCountriesSelected && mapRef.current) {
					const bounds = object ? getFeatureBounds(object.geometry) : null;

					if (bounds) {
						mapRef.current.fitBounds(bounds, { padding: 60, duration: 1200 });
					} else if (coordinate) {
						mapRef.current.flyTo({
							center: [coordinate[0], coordinate[1]],
							zoom: 4,
							duration: 1200,
						});
					}
				}
			}
		}
	}, [
		selectedCountries,
		addCountry,
		removeCountry,
		setFocusedCountryId,
		mapRef,
		closeHoverPanel,
	]);

	return {
		hoverInfo,
		setHoverInfo,
		handleHover,
		handleClick,
		handleMapInteractionStart,
		handleMapInteractionEnd,
		closeHoverPanel,
	};
}