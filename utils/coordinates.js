export function extractCoordinates(stringWithCoordinates) {
  const coordinatesPattern = /\[-?\d+\.\d+,-?\d+\.\d+\]/g;
const match = stringWithCoordinates.match( coordinatesPattern )
  if (!match) {
    return false
  }
return JSON.parse(match[0])
}
