import { useMemo, useRef } from "react";
import { Map, useControl, MapRef } from "react-map-gl/maplibre";
import { GeoJsonLayer } from '@deck.gl/layers';
import { MapboxOverlay } from '@deck.gl/mapbox';

import mockLinguisticProfiles from "./api";
import { SelectPanel, InfoPanel, HoverPanel } from "./components/panels";
import { getCommunicabilityColor, getElevation, useMapInteractions, useAtlasContext } from "./utils";

import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css'

import type { MapboxOverlayProps } from "@deck.gl/mapbox";
import type { CountryFeatureProperties } from "./types";


function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}


export default function App() {
  const mapRef = useRef<MapRef>(null);
  const { selectedLanguages, selectedCountries } = useAtlasContext();
  const hasActiveData = selectedLanguages.length > 0 || selectedCountries.length > 0;

  const {
    hoverInfo,
    setHoverInfo,
    handleHover,
    handleClick,
    handleMapInteractionStart,
    handleMapInteractionEnd,
    closeHoverPanel
  } = useMapInteractions(mapRef);

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
      onHover: handleHover,
      onClick: handleClick
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
  ], [mockLinguisticProfiles, handleHover, handleClick]);

  return (
    <div className="appContainer">
      <div className="mapContainer">
        <Map
          ref={mapRef}
          mapStyle={hasActiveData ? '/basemap-data.style.json' : '/basemap-context.style.json'}
          initialViewState={{
            longitude: 22,
            latitude: 27,
            zoom: 1.8,
            pitch: 0
          }}
          onMoveStart={handleMapInteractionStart}
          onMoveEnd={handleMapInteractionEnd}
          onZoomStart={handleMapInteractionStart}
          onZoomEnd={handleMapInteractionEnd}
          onPitchStart={handleMapInteractionStart}
          onPitchEnd={handleMapInteractionEnd}
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
        <SelectPanel onMouseEnter={closeHoverPanel} />
        <InfoPanel onMouseEnter={closeHoverPanel} />
        <HoverPanel 
          isVisible={hoverInfo.isVisible}
          x={hoverInfo.x}
          y={hoverInfo.y}
          countryName={"France"}
          population={67000000}
          continent="Europe"
          communicabilityIndex={0.65}
          onClose={closeHoverPanel}
          onMouseEnter={() => setHoverInfo(prev => ({ ...prev, isLocked: true }))}
          onMouseLeave={closeHoverPanel}
        />
      </div>
    </div>
  )
}
