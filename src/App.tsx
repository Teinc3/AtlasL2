import { useState, useMemo } from "react";
import { Map, useControl } from "react-map-gl/maplibre";
import { MapboxOverlay } from '@deck.gl/mapbox';
import { GeoJsonLayer } from '@deck.gl/layers';

import { SelectPanel, InfoPanel} from "./components/panels";
import { getCommunicabilityColor, getElevation } from "./utils";

import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css'

import type { MapboxOverlayProps } from "@deck.gl/mapbox";
import type CountryFeatureProperties from "./types/geojson.types";
import mockLinguisticProfiles from "./api";


function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}


export default function App() {
  const [hasActiveData, _] = useState(false);

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
      </div>
    </div>
  )
}
