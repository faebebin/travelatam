import { fromLonLat } from 'ol/proj';
import { getOSMLatLonFromNames } from '../helpers/geo'


export async function extractLocationLatLon(stringWithCoordinates) {
  if (!stringWithCoordinates) return null
  const stringWithoutSpaces = stringWithCoordinates.replace(/\s/g, '')
  let coordinates = extractLocationCoordinates(stringWithoutSpaces)
  if (!coordinates) {
    const coordinates = await extractLocationNames(stringWithoutSpaces)
  }
  return coordinates
}

export function extractLocationCoordinates(locationCoordinates) {
  const coordinatesPattern = /\[-?\d+\.\d+,-?\d+\.\d+\]/g;
  const match = locationCoordinates.match(coordinatesPattern)
  if (!match) return null
  return JSON.parse(match[0])
}

export async function extractLocationNames(locationNames) {
  const namesPattern = /\[[a-z0-9,]+\]/g;
  const match = locationNames.match(namesPattern)
  if (!match) return null
  const osmSearchNames = match[0].replace(/\[|\]/g, '').split(',')
  return await getOSMLatLonFromNames(...osmSearchNames)
}

export function fromLatLon(latLon) {
  // To default EPSG:3857
  if (!Array.isArray(latLon)) {
    // NOTE: Else strange error '.reverse() not a function'
    return false
  }
  return fromLonLat(latLon.reverse())
}
