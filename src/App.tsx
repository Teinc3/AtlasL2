import { useState } from "react";
import { Map, useControl } from "react-map-gl/maplibre";
import { MapboxOverlay } from '@deck.gl/mapbox';
import { GeoJsonLayer } from '@deck.gl/layers';

import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css'

import type { MapboxOverlayProps } from "@deck.gl/mapbox";


function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}


export default function App() {
  const [hasActiveData, _] = useState(false);

  const layers = [
    new GeoJsonLayer({
      id: 'golden-border-layer',
      data: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson',
      stroked: true,
      lineWidthUnits: 'pixels',
      getLineWidth: 1,
      getLineColor: [255, 215, 0, 200],
      lineWidthMinPixels: 0.25,
      beforeId: 'place_continent',
    })
  ]

  return (
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
      >
        <DeckGLOverlay layers={layers} interleaved />
      </Map>
    </div>
  )
}
