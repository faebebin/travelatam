import { fromLonLat } from 'ol/proj';
import { getOSMLatLonFromNames } from '../helpers/geo'


export async function extractLocationLatLon(stringWithCoordinates) {
  if (!stringWithCoordinates) return null
  const stringWithoutSpaces = stringWithCoordinates.replace(/\s/g, '')
  let coordinates = extractLocationCoordinates(stringWithoutSpaces)
  if (!coordinates) {
    const osmSearchArray = extractLocationNames(stringWithoutSpaces)
    if (!osmSearchArray) return null
    coordinates = await getOSMLatLonFromNames(...osmSearchArray)
  }
  return coordinates
}

export function extractLocationCoordinates(locationCoordinates) {
  const coordinatesPattern = /\[-?\d+\.\d+,-?\d+\.\d+\]/g;
  const match = locationCoordinates.match(coordinatesPattern)
  if (!match) return null
  return JSON.parse(match[0])
}

export function extractLocationNames(locationNames) {
  const namesPattern = /\[[a-zA-Z0-9,]+\]/g;
  const match = locationNames.match(namesPattern)
  if (!match) return null
  return match[0].replace(/\[|\]/g, '').split(',')
}

export function fromLatLon(latLon) {
  // To default EPSG:3857
  if (!Array.isArray(latLon)) {
    // NOTE: Else strange error '.reverse() not a function'
    return false
  }
  return fromLonLat(latLon.reverse())
}
