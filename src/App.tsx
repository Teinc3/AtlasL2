import { useState, useMemo, useRef, useCallback } from "react";
import { Map, useControl } from "react-map-gl/maplibre";
import { MapboxOverlay } from '@deck.gl/mapbox';
import { GeoJsonLayer } from '@deck.gl/layers';

import mockLinguisticProfiles from "./api";
import { SelectPanel, InfoPanel, HoverPanel } from "./components/panels";
import { getCommunicabilityColor, getElevation } from "./utils";

import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css'

import type { Feature, Geometry } from "geojson";
import type { MapboxOverlayProps } from "@deck.gl/mapbox";
import type { PickingInfo } from "@deck.gl/core";
import type CountryFeatureProperties from "./types/geojson.types";
import type { HoverState } from "./types/props.types";


function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}


export default function App() {
  const [hasActiveData, _] = useState(false);

  const [hoverInfo, setHoverInfo] = useState<HoverState>({
    isVisible: false,
    x: 0,
    y: 0,
    countryId: null,
    isLocked: false
  });

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentHoveredCountryRef = useRef<string | null>(null);

  const handleHover = useCallback((
    info: PickingInfo<Feature<Geometry, CountryFeatureProperties>>
  ) => {
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
          }, 1800);
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

  const closeHoverPanel = () => {
    setHoverInfo(prev => ({ ...prev, isVisible: false, isLocked: false, countryId: null }));
    currentHoveredCountryRef.current = null;
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
  };

  const layers = useMemo(() => [
    new GeoJsonLayer<CountryFeatureProperties>({
      id: 'country-fill-layer',
      data: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson',
      filled: true,
      stroked: false,
      extruded: true,
      wireframe: false,
      getFillColor: getCommunicabilityColor,
      getElevation,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 50],
      pickable: true,
      onHover: handleHover
    }),
    new GeoJsonLayer<CountryFeatureProperties>({
      id: 'golden-wall-layer',
      data: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson',
      filled: false,
      stroked: true,
      extruded: false,
      wireframe: false,
      getLineColor: [255, 215, 0, 220],
      lineWidthUnits: 'pixels',
      getLineWidth: 1,
      lineWidthMinPixels: 0.6,
    })
  ], [mockLinguisticProfiles]);

  return (
    <div className="appContainer">
      <div className="mapContainer">
        <Map
          mapStyle={hasActiveData ? '/basemap-data.style.json' : '/basemap-context.style.json'}
          initialViewState={{
            longitude: 22,
            latitude: 27,
            zoom: 1.8,
            pitch: 0
          }}
          bearing={0}
          maxPitch={30}
          attributionControl={{
            compact: false
          }}
        >
          <DeckGLOverlay layers={layers} />
        </Map>
      </div>
      <div className="uiOverlay">
        <SelectPanel />
        <InfoPanel />
        <HoverPanel 
          isVisible={hoverInfo.isVisible}
          x={hoverInfo.x}
          y={hoverInfo.y}
          countryName={"France"}
          population={67000000}
          continent="Europe"
          isInRegion={true}
          onClose={closeHoverPanel}
          onMouseEnter={() => setHoverInfo(prev => ({ ...prev, isLocked: true }))}
          onMouseLeave={closeHoverPanel}
        />
      </div>
    </div>
  )
}
