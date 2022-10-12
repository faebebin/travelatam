import { describe, expect, it } from 'vitest'
import { extractCoordinatesLatLon, fromLatLon } from '../../utils/parseCaption'

describe("extractCoordinates", () => {
  it('extracts coordinates from a string', () => {
    const coordinates = '[10.425664,75.548631]'
    const someStringWithCoordinates = `Some text, ${coordinates} and more`
    expect(extractCoordinatesLatLon(someStringWithCoordinates)).toEqual(JSON.parse(coordinates));
  });

  it('tolerates whitespaces', () => {
    const coordinates = '[  10.425664, -75.548631]'
    const someStringWithCoordinates = `Some text, ${coordinates} and more`
    expect(extractCoordinatesLatLon(someStringWithCoordinates)).toEqual(JSON.parse(coordinates));
  });

  it('extracts negative coordinates from a string', () => {
    const coordinates = '[-10.425664,-75.548631]'
    const someStringWithCoordinates = `Some text, ${coordinates} and more`
    expect(extractCoordinatesLatLon(someStringWithCoordinates)).toEqual(JSON.parse(coordinates));
  });

  it('returns falls if no coordinates', () => {
    const someStringWithoutCoordinates = `Some text without coordinates`
    expect(extractCoordinatesLatLon(someStringWithoutCoordinates)).toBeFalsy;
  });
});

describe("fromLatLon", () => {
  it('converts from latLon to EPSG:3857', () => {
    expect(fromLatLon([10.42, -75.54])).toEqual(
      [-8409074.334523886,
        1166396.554068148]
    );
  });
});

