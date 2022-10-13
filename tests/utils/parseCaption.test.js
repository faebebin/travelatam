import { describe, expect, it } from 'vitest'
import { extractLocationLatLon, fromLatLon, extractLocationNames, removeWhitespace, extractDate } from '../../utils/parseCaption'

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

  // TODO test also for location names
});

describe("extractLocationNames", () => {
  it('returns an array of osm search strings', () => {
    const searchString = '[Bogota,Colombia]'
    const someStringWithLocationNames = `Sometext,${searchString}andmore`
    expect(extractLocationNames(someStringWithLocationNames)).toEqual(['Bogota', 'Colombia']
    );
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

describe("extractDate", () => {
  it.each([
    ['1.2.2022'],
    ['01.2.2022'],
    ['01.02.2022'],
    ['1.2.22'],
    ['1.2.022'],
    ['11.12.2022'],
  ])('returns new Date for a string including date like "%s"', (dateString) => {
    expect(extractDate(`Some text, written on ${dateString} and before`)).toEqual(new Date(dateString))
  })
});

describe("removeWhitespace", () => {
  it('returns string without any whitespaces', () => {
    expect(removeWhitespace(' ab    sdf . ')).toMatch('absdf.');
  });
});

