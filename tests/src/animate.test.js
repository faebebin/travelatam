import { describe, expect, it } from 'vitest'
import { turnTowards, vehicleByDistance } from '../../src/animate'

describe("turnTowards", () => {
  it('returns a radiant number for two coordinates', () => {
    const current = [951492.2156064266, 6017319.034026715]
    const destination = [-397944.9156877944, 4938708.142809832]
    expect(turnTowards(current, destination, 1).toFixed(3)).toMatch('-1.245');
  });
});

describe("vehicleByDistance", () => {
  it('returns the right vehicle for the distance', () => {
    const vehicleConfig = [
      { maxDistance: Infinity, symbol: '✈️ ', name: 'airplane', azimuthCorrection: -0.785398 }
    ]
    const current = [951492.2156064266, 6017319.034026715]
    const destination = [-397944.9156877944, 4938708.142809832]
    expect(vehicleByDistance(current, destination, vehicleConfig).name).toMatch('airplane')
  });
});

