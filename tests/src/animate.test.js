import { describe, expect, it } from 'vitest'
import { turnTowards, choseVehicleByDistance, choseVehicleByName } from '../../src/animate'

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

describe("choseVehicleByName", () => {
  it('returns the right vehicle for given Name', () => {
    expect(choseVehicleByName('A string includig boat  and ...').name).toMatch('boat')
  });

  it('ignores case', () => {
    expect(choseVehicleByName(' A string BoAt and more').name).toMatch('boat')
  });

  // it('needs surrounding space if not beginning or end of line', () => {
  //   expect(choseVehicleByName('A string includigBoat and ...')).toBeUndefined
  // });
});

