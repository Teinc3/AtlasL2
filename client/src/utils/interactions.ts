import { useState, useRef, useCallback } from "react";

import useAtlasContext from "./context";
import { getFeatureBounds } from "./geometry";

import type { Feature, Geometry } from "geojson";
import type { MapRef } from "react-map-gl/maplibre";
import type { MjolnirEvent } from 'mjolnir.js';
import type { PickingInfo } from "@deck.gl/core";
import type { CountryFeatureProperties, HoverState } from "../types";


export default function useMapInteractions(mapRef: React.RefObject<MapRef | null>) {
  const { selectedCountries, addCountry, removeCountry, setSelectedCountries } = useAtlasContext();

  const [hoverInfo, setHoverInfo] = useState<HoverState>({
    isVisible: false,
    x: 0,
    y: 0,
    countryId: null,
    isLocked: false
  });

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentHoveredCountryRef = useRef<string | null>(null);
  const isMovingRef = useRef<boolean>(false);

  const closeHoverPanel = useCallback(() => {
    setHoverInfo(prev => ({ ...prev, isVisible: false, isLocked: false, countryId: null }));
    currentHoveredCountryRef.current = null;
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
  }, []);

  const handleHover = useCallback((
    info: PickingInfo<Feature<Geometry, CountryFeatureProperties>>
  ) => {
    if (isMovingRef.current) {
      return;
    }

    const { object, x, y } = info;
    const countryId = object?.properties?.ADM0_A3 || null;

    setHoverInfo(prev => {
      // If we are fully locked and hovered onto the tooltip container, return
      if (prev.isLocked && !countryId) {
        return prev;
      }

      // We hovered onto empty space or another country while panel is not locked
      if (countryId !== currentHoveredCountryRef.current) {
        if (hoverTimerRef.current) {
          clearTimeout(hoverTimerRef.current);
        }
        currentHoveredCountryRef.current = countryId;

        if (countryId) {
          hoverTimerRef.current = setTimeout(() => {
            setHoverInfo(s => ({ ...s, isVisible: true, isLocked: true }));
          }, 1500);
        } else {
          return { ...prev, isVisible: false, countryId: null, isLocked: false };
        }
      }
      
      // Update coords if panel isn't locked
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

  const handleClick = useCallback((
    info: PickingInfo<Feature<Geometry, CountryFeatureProperties>>,
    event: MjolnirEvent
  ) => {
    const { object, coordinate } = info;
    const countryId = object?.properties?.ADM0_A3 || null;

    closeHoverPanel();

    if (countryId) {
      const isShiftPressed = event.srcEvent.shiftKey;
      const targetCountry = "France"; // Temporary override as requested

      if (isShiftPressed) {
        if (selectedCountries.includes(targetCountry)) {
          removeCountry(targetCountry);
        } else {
          addCountry(targetCountry);
        }
      } else {
        setSelectedCountries([targetCountry]);
        
        if (mapRef.current) {
          const bounds = object ? getFeatureBounds(object.geometry) : null;
          
          if (bounds) {
            mapRef.current.fitBounds(bounds, { padding: 60, duration: 1200 });
          } else if (coordinate) {
            mapRef.current.flyTo({
              center: [coordinate[0], coordinate[1]],
              zoom: 4,
              duration: 1200,
              essential: true,
            });
          }
        }
      }
    }
  }, [selectedCountries, addCountry, removeCountry, setSelectedCountries, mapRef, closeHoverPanel]);

  return {
    hoverInfo,
    setHoverInfo,
    handleHover,
    handleClick,
    handleMapInteractionStart,
    handleMapInteractionEnd,
    closeHoverPanel
  };
}
