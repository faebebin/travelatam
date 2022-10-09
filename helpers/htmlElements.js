export function createImageElement(img_url) {
  return `<img height=100 width=100 src=${img_url}>`
}

export function createImageCollectionElement(img_urls) {
  return img_urls.reduce(function(htmlString, url) {
    return htmlString + createImageElement(url);
  }, '');
}
