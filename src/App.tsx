import { Map, useControl } from "react-map-gl/maplibre";
import { MapboxOverlay } from '@deck.gl/mapbox';

import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css'

import type { MapboxOverlayProps } from "@deck.gl/mapbox";


function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}


export default function App() {
  return (
    <div className="mapContainer">
      <Map
        mapStyle={"https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"}
        initialViewState={{
          longitude: 22,
          latitude: 27,
          zoom: 1.8
        }}
        style={{
          width: '100dvw',
          height: '100dvh'
        }}
      >
        <DeckGLOverlay layers={[]} interleaved />
      </Map>
    </div>
  )
}
