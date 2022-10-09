import { describe, expect, it } from 'vitest'
import { extractCoordinates } from '../../utils/coordinates'

describe("extractCoordinates", () => {
  it('extracts coordinates from a string', () => {
    const coordinates = '[10.425664,75.548631]'
    const someStringWithCoordinates = `Some text, ${coordinates} and more`
    expect(extractCoordinates(someStringWithCoordinates)).toEqual(JSON.parse(coordinates));
  });

  it('extracts negative coordinates from a string', () => {
    const coordinates = '[-10.425664,-75.548631]'
    const someStringWithCoordinates = `Some text, ${coordinates} and more`
    expect(extractCoordinates(someStringWithCoordinates)).toEqual(JSON.parse(coordinates));
  });

  it('returns falls if no coordinates', () => {
    const someStringWithoutCoordinates = `Some text without coordinates`
    expect(extractCoordinates(someStringWithoutCoordinates)).toBeFalsy;
  });
});

