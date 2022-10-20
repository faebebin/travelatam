import { describe, expect, it } from 'vitest'
import { toNominatimSearchParams } from '../../src/geo'

describe("toNominatimSearchParams", () => {
  it.each([
    ['normal', 'city,street,country', "city,+street,+country"],
    ['containing spaces', 'Santa Marta,Colombia', "Santa%20Marta,+Colombia"],
    [
      'containing many spaces',
      '  Zürich  Flughafen, Schweiz  ', 
      'Zürich%20Flughafen,+Schweiz'
    ],
  ])('returns OSM nominatim param for string %s', (name, params, expected) => {
    expect(toNominatimSearchParams(params)).toEqual(expected)
  })
});


