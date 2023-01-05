import { describe, expect, it } from 'vitest'
import { greatCircleDistance } from '../../src/geo'

describe("greatCircleDistance", () => {
  it('returns greatcircle distance for two coordinates', () => {
    const coordinatesA = [951492.2156064266, 6017319.034026715]
    const coordinatesB = [-397944.9156877944, 4938708.142809832]
    expect(greatCircleDistance(coordinatesA, coordinatesB).toFixed(3)).toMatch('1238429.278')
  });
});

