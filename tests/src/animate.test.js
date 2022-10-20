import { describe, expect, it } from 'vitest'
import { turnTowards, choseVehicleByDistance } from '../../src/animate'

describe("turnTowards", () => {
  it('returns a radiant number for two coordinates', () => {
    const current = [951492.2156064266, 6017319.034026715]
    const destination = [-397944.9156877944, 4938708.142809832]
    expect(turnTowards(current, destination, 1).toFixed(3)).toMatch('-1.245');
  });
});

describe("choseVehicleByDistance", () => {
  it('returns the right vehicle for the distance', () => {
    expect(choseVehicleByDistance(1000001).name).toMatch('airplane')
  });

  it('returns the right vehicle for the distance', () => {
    expect(choseVehicleByDistance(999999).name).toMatch('bus')
  });
});

