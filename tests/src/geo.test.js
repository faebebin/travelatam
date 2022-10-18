import { describe, expect, it } from 'vitest'
import { toNominatimSearchParams } from '../../src/geo'

describe("toNominatimSearchParams", () => {
  it('returns OSM nominatim search string', () => {
    expect(toNominatimSearchParams('city,street,country')).toMatch("city,+street,+country");
  });
});

