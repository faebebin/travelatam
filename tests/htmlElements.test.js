import { describe, expect, it } from 'vitest'
import { createImageCollectionElement, createImageElement } from '../helpers/htmlElements'

describe("createImageElement", () => {
  it('returns an htmlString with image elements', () => {
    const htmlString = '<img height=100 width=100 src=url1>'
    expect(createImageElement('url1')).toMatch(htmlString);
  });
});

describe("createImageCollectionElement", () => {
  it('returns an htmlString with image elements', () => {
    const urls = ['url1', 'url2']
    // const htmlString = `${createImageElement(urls[0])}${createImageElement(urls[1])}>`
    // FIXME: why above errors ?
    const htmlString = '<img height=100 width=100 src=url1><img height=100 width=100 src=url2>'
    expect(createImageCollectionElement(urls)).toMatch(htmlString);
  });
});
