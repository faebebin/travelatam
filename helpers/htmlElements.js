export function createImageElement(img_size, imgUrl) {
  const img = new Image(img_size, img_size);
  img.src = imgUrl;
  return img
}

export function appendImageToDOM(img_size, container, imgUrl) {
  const img = createImageElement(img_size, imgUrl)
  container.appendChild(img)
  // TODO handle failure
  return img.decode()
}

export function createImageCollectionElement(img_size, container, imgUrls) {
  // TODO: create all images and keep them ready for inserting into overlay? OR create and destroy
  // precaching? https://stackoverflow.com/questions/10240110/how-do-you-cache-an-image-in-javascript

  // TODO handle order of images?
  return Promise.allSettled(
    imgUrls.map(imgUrl => appendImageToDOM(img_size, container, imgUrl))
  )
}
