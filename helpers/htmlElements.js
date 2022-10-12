export function createImageElement(imgUrl) {
  const img = new Image();
  img.src = imgUrl;
  img.height = 100
  img.width = 100
  return img
}

export function appendImageToDOM(container, imgUrl) {
  const img = createImageElement(imgUrl)
  container.appendChild(img)
  // TODO handle failure
  return img.decode()
}

export function createImageCollectionElement(container, imgUrls) {
  // TODO: create all images and keep them ready for inserting into overlay? OR create and destroy
  // precaching? https://stackoverflow.com/questions/10240110/how-do-you-cache-an-image-in-javascript

  // TODO handle order of images?
  return Promise.allSettled(
    imgUrls.map(imgUrl => appendImageToDOM(container, imgUrl))
  )
}
