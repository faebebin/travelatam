import { describe, expect, it } from 'vitest'
import { toNominatimSearchParams, greatCircleDistance } from '../../src/geo'

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

describe("greatCircleDistance", () => {
  it('returns greatcircle distance for two coordinates', () => {
    const coordinatesA = [951492.2156064266, 6017319.034026715]
    const coordinatesB = [-397944.9156877944, 4938708.142809832]
    expect(greatCircleDistance(coordinatesA, coordinatesB).toFixed(3)).toMatch('1238429.278')
  });
});

