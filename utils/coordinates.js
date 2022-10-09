import { fromLonLat } from 'ol/proj';

export function extractCoordinates(stringWithCoordinates) {
  const coordinatesPattern = /\[-?\d+\.\d+,-?\d+\.\d+\]/g;
  const match = stringWithCoordinates.match(coordinatesPattern)
  if (!match) {
    return false
  }
  const LatLon = JSON.parse(match[0])
  return fromLonLat(LatLon.reverse())
}
