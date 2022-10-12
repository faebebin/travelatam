import { fromLonLat } from 'ol/proj';

export function extractCoordinatesLatLon(stringWithCoordinates) {
  const coordinatesPattern = /\[-?\d+\.\d+,-?\d+\.\d+\]/g;
  const stringWithCoordinatesNoSpaces = stringWithCoordinates.replace(/\s/g, '')
  const match = stringWithCoordinatesNoSpaces.match(coordinatesPattern)
  if (!match) {
    return false
  }
  return JSON.parse(match[0])
}

export function fromLatLon(latLon) {
  // To default EPSG:3857
  if (!Array.isArray(latLon)) {
    // NOTE: Else strange error '.reverse() not a function'
    return false
  }
  return fromLonLat(latLon.reverse())
}
