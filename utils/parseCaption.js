import { fromLonLat } from 'ol/proj';
import { getOSMLatLonFromNames } from '../src/geo'


export async function extractLocationLatLon(stringInclLocation) { // Promise
  if (!stringInclLocation) return null
  const stringWithoutSpaces = removeWhitespace(stringInclLocation)
  let coordinates = extractLocationCoordinates(stringWithoutSpaces)
  if (coordinates) return coordinates

  const osmSearchTerms = extractLocationNames(stringWithoutSpaces)
  if (!osmSearchTerms) return null
  return getOSMLatLonFromNames(osmSearchTerms)
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

export function extractDateTime(stringInclDate) {
  if (!stringInclDate) return null
  const datePattern = /\d{1,2}\.\d{1,2}\.\d{2,4}/g;
  const dateMatch = stringInclDate.match(datePattern)
  if (!dateMatch) return null
  const timePattern = /\d{1,2}\:\d{1,2}/g;
  const timeMatch = stringInclDate.match(timePattern)
  // NOTE: js parses datestring as mm.dd.yy
  const [m, d, y] = dateMatch[0].split('.')
  const dateString = `${d}.${m}.${y}`
  const timeString = timeMatch ? ` ${timeMatch[0]}` : ''
  return new Date(`${dateString}${timeString}`)
}

export function removeWhitespace(string) {
  return string.replace(/\s/g, '')
}

