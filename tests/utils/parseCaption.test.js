import { describe, expect, it } from 'vitest'
import { extractLocationLatLon, fromLatLon } from '../../utils/parseCaption'

describe("extractCoordinates", () => {
  it('extracts coordinates from a string', async () => {
    const coordinates = '[10.425664,75.548631]'
    const someStringWithCoordinates = `Some text, ${coordinates} and more`
    expect(await extractLocationLatLon(someStringWithCoordinates)).toEqual(JSON.parse(coordinates));
  });

  it('tolerates whitespaces', async () => {
    const coordinates = '[  10.425664, -75.548631]'
    const someStringWithCoordinates = `Some text, ${coordinates} and more`
    expect(await extractLocationLatLon(someStringWithCoordinates)).toEqual(JSON.parse(coordinates));
  });

  it('extracts negative coordinates from a string', async () => {
    const coordinates = '[-10.425664,-75.548631]'
    const someStringWithCoordinates = `Some text, ${coordinates} and more`
    expect(await extractLocationLatLon(someStringWithCoordinates)).toEqual(JSON.parse(coordinates));
  });

  it('returns falls if no coordinates', async () => {
    const someStringWithoutCoordinates = `Some text without coordinates`
    expect(await extractLocationLatLon(someStringWithoutCoordinates)).toBeNull();
  });

  // TODO test 
});

describe("fromLatLon", () => {
  it('converts from latLon to EPSG:3857', () => {
    expect(fromLatLon([10.42, -75.54])).toEqual(
      [-8409074.334523886,
        1166396.554068148]
    );
  });
});

