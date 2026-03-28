import type { Geometry } from "geojson";


/**
 * Utility function to compute bounds across the antimeridian
 * Preventing issues with countries like USA, Russia, Fiji that have
 * territories on both sides of the IDL
 */
export function getFeatureBounds(geometry: Geometry): [[number, number], [number, number]] | null {
  if (!geometry) {
    return null;
  }

  let minLat = 90, maxLat = -90;
  const longitudes: number[] = [];

  const extract = (coords: any[]) => {
    if (typeof coords[0] === "number") {
      longitudes.push(coords[0] as number);
      if (coords[1] < minLat) {
        minLat = coords[1];
      }
      if (coords[1] > maxLat) {
        maxLat = coords[1];
      }
    } else {
      coords.forEach(extract);
    }
  };
  
  if (geometry.type === "Polygon" || geometry.type === "MultiPolygon") {
    extract(geometry.coordinates);
  } else {
    return null;
  }

  if (longitudes.length === 0) {
    return null;
  }

  const sortedLngs = [...new Set(longitudes)].sort((a, b) => a - b);
  let maxGap = 0;
  let gapStart = sortedLngs[0];
  let gapEnd = sortedLngs[sortedLngs.length - 1];

  for (let i = 0; i < sortedLngs.length - 1; i++) {
    const gap = sortedLngs[i + 1] - sortedLngs[i];
    if (gap > maxGap) {
      maxGap = gap;
      gapStart = sortedLngs[i];
      gapEnd = sortedLngs[i + 1];
    }
  }

  const datelineGap = (sortedLngs[0] + 360) - sortedLngs[sortedLngs.length - 1];
  
  // If the largest continuous gap is not over the dateline,
  // it means the country physically wraps the dateline
  if (maxGap > datelineGap && maxGap > 100) {
    return [
      [gapEnd, minLat],
      [gapStart + 360, maxLat]
    ];
  }

  return [
    [sortedLngs[0], minLat],
    [sortedLngs[sortedLngs.length - 1], maxLat]
  ];
}
