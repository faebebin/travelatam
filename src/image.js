import { scrollEnd } from '../utils/promisify'

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

export async function createImageCollectionElement(img_size, container, imgUrls) {
  // precaching? https://stackoverflow.com/questions/10240110/how-do-you-cache-an-image-in-javascript

  // TODO handle order of images?
  return Promise.allSettled(
    imgUrls.map(imgUrl => appendImageToDOM(img_size, container, imgUrl))
  )
}

export async function carouselNext(imagesEl, image_width, times = 1) {
  const currentPosition = imagesEl.scrollLeft
  const offset = currentPosition + (image_width * times)
  imagesEl.scrollTo({ left: offset, behavior: 'smooth' })
  // FIXME: Better attach to el.onscroll, but then fires to often?
  await scrollEnd(imagesEl)
}

export async function carouselPrevious(imagesEl, image_width, times = 1) {
  const currentPosition = imagesEl.scrollLeft
  const offset = currentPosition - (image_width * times)
  imagesEl.scrollTo({ left: offset, behavior: 'smooth' })
  await scrollEnd(imagesEl)
}


export function setCarouselPreviousVisibility(imagesEl, buttonEl) {
  if (imagesEl.scrollLeft === 0) {
    buttonEl.style.display = 'none'
  } else {
    buttonEl.style.display = 'block'
  }
}

export function setCarouselNextVisibility(imagesEl, buttonEl) {
  if (imagesEl.scrollWidth - imagesEl.scrollLeft === imagesEl.offsetWidth) {
    buttonEl.style.display = 'none'
  } else {
    buttonEl.style.display = 'block'
  }
}

