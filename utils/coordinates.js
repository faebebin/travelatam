import { fromLonLat } from 'ol/proj';

export function extractCoordinatesLatLon(stringWithCoordinates) {
  const coordinatesPattern = /\[-?\d+\.\d+,-?\d+\.\d+\]/g;
  const match = stringWithCoordinates.match(coordinatesPattern)
  if (!match) {
    return false
  }
  return JSON.parse(match[0])
}

export function fromLatLon(latLon) {
  if (!Array.isArray(latLon)) {
    // NOTE: Else strange error '.reverse() not a function'
    return false
  }
  return fromLonLat(latLon.reverse())
}
