export function createImageElement(img_url) {
  const img = new Image();
  img.src = img_url;
  img.height = 100
  img.width = 100
  return img
}

export function appendImageToDOM(container, img_url) {
  const img = createImageElement(img_url)
  container.appendChild(img)
  // TODO handle failure
  return img.decode()
}

export function createImageCollectionElement(container, img_urls) {
  // TODO: create all images and keep them ready for inserting into overlay? OR create and destroy
  // precaching? https://stackoverflow.com/questions/10240110/how-do-you-cache-an-image-in-javascript

  // TODO handle order of images?
  return Promise.allSettled(
    img_urls.map(img_url => appendImageToDOM(container, img_url))
  )
}
