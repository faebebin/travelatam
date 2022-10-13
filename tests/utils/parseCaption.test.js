import { describe, expect, it } from 'vitest'
import { extractLocationLatLon, fromLatLon, extractLocationNames, removeWhitespace, extractDateTime } from '../../utils/parseCaption'

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

  // it('find coorinates for location names in a string', async () => {
  //   TODO fetch mock
  //   const location = '[Bogota, Colombia]'
  //   const someStringWithNames = `Some text, ${location} and more`
  //   const coordinates = await extractLocationLatLon(someStringWithNames)
  //   expect(JSON.stringify(coordinates)).toMatch(/\[-?\d+\.\d+,-?\d+\.\d+\]/g);
  // });


  it('returns falls if no coordinates', async () => {
    const someStringWithoutCoordinates = `Some text without coordinates`
    expect(await extractLocationLatLon(someStringWithoutCoordinates)).toBeNull();
  });
});

describe("extractLocationNames", () => {
  it.each([
    ['[Bogota,Colombia]', 'Bogota,Colombia'],
    ['[Zürich,Flughafen,Schweiz]', 'Zürich,Flughafen,Schweiz'],
    ['[Yvéèrdoñ]', 'Yvéèrdoñ'],
    ['[Street,nr,City,Country]', 'Street,nr,City,Country'],
  ])('returns an osm search string for "%s"', (searchString, expected) => {
    const someStringWithLocationNames = `Sometext,${searchString}andmore`
    expect(extractLocationNames(someStringWithLocationNames)).toMatch(expected);
    // it('returns an array of osm search strings', () => {
  })
});

describe("fromLatLon", () => {
  it('converts from latLon to EPSG:3857', () => {
    expect(fromLatLon([10.42, -75.54])).toEqual(
      [-8409074.334523886,
        1166396.554068148]
    );
  });
});

describe("extractDateTime", () => {
  it.each([
    ['1.2.2022', '', [2022, 0]],
    ['01.2.2022', 'notime', [2022, 0]],
    ['01.02.2022', '', [2022, 0]],
    ['1.2.22', '1:1', [2022, 1]],
    ['1.2.022', '01:01', [2022, 1]],
    ['11.12.2022', '11:11', [2022, 11]],
    ['', '12:00', [undefined, undefined]],
    // ['222.1.2022', '12:00', [undefined, undefined]], TODO exclude neighbouring numbers
    // ['1.2.20221', '', [undefined, undefined]],
  ])('returns Date given a string including date "%s" and time "%s"', (date, time, expected) => {
    const extracted = extractDateTime(`Some text, written on ${date}  at ${time} and before`)
    expect([extracted?.getFullYear(), extracted?.getHours()]).toEqual(expected)
  })
});

describe("removeWhitespace", () => {
  it('returns string without any whitespaces', () => {
    expect(removeWhitespace(' ab    sdf . ')).toMatch('absdf.');
  });
});

