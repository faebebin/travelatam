import { fromLonLat } from 'ol/proj';
import { getOSMLatLonFromNames } from '../helpers/geo'


export async function extractLocationLatLon(stringInclLocation) {
  if (!stringInclLocation) return null
  const stringWithoutSpaces = removeWhitespace(stringInclLocation)
  let coordinates = extractLocationCoordinates(stringWithoutSpaces)
  if (!coordinates) {
    const osmSearchTerms = extractLocationNames(stringWithoutSpaces)
    if (!osmSearchTerms) return null
    coordinates = await getOSMLatLonFromNames(osmSearchTerms)
  }
  return coordinates
}

export function extractLocationCoordinates(stringInclCoordinates) {
  const pattern = /\[-?\d+\.\d+,-?\d+\.\d+\]/g;
  const match = stringInclCoordinates.match(pattern)
  if (!match) return null
  return JSON.parse(match[0])
}

export function extractLocationNames(stringInclNames) {
  const pattern = /\[[\w\W,]+\]/g;
  const match = stringInclNames.match(pattern)
  if (!match) return null
  // return match[0].replace(/\[|\]/g, '').split(',')
  return match[0].replace(/\[|\]/g, '')
}

export function fromLatLon(latLon) {
  // To default EPSG:3857
  if (!Array.isArray(latLon)) {
    // NOTE: Else strange error '.reverse() not a function' TODO TS
    return false
  }
  return fromLonLat(latLon.reverse())
}

export function extractDate(stringInclDate) {
  if (!stringInclDate) return null
  const pattern = /\d{1,2}\.\d{1,2}\.\d{2,4}/g;
  const match = stringInclDate.match(pattern)
  if (!match) return null
  return new Date(match[0])
}

export function removeWhitespace(string) {
  return string.replace(/\s/g, '')
}

