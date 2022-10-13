export async function getOSMLatLonFromNames(osmSearchTerms) {
  // eg: https://nominatim.openstreetmap.org/search?q=bogota,+colombia&format=json
  const searchParams = toNominatimSearchParams(osmSearchTerms)
  const url = `https://nominatim.openstreetmap.org/search?q=${searchParams}&format=json`
  const response = await fetch(url)
  // TODO if !response.ok { return text}
  const json = await response.json()
  const data = json[0]
  if (!data) return null // TODO msg: Location not found
  const lat = data.lat
  const lon = data.lon
  return [lat, lon]
}

export function toNominatimSearchParams(osmSearchTerms) {
  // FIXME only exported for testing. Try https://github.com/jhnns/rewire with vitest?
  // return Object.values(arguments).join(',+')
  return osmSearchTerms.replace(/,/g, ',+')
}

