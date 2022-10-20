import './style.css';
import { Collection, Map } from 'ol';
import VectorSource from "ol/source/Vector";
import { getMediaUrls, getPostItems, getPosts } from './src/api'
import { carouselNext, carouselPrevious, createImageCollectionElement, setCarouselNextVisibility, setCarouselPreviousVisibility } from './src/image'
import { zoomTo, turnTowards, choseVehicle, vehicles, movements } from './src/animate'
import { wait } from './utils/promisify'
import { createMediaOverlay, createOSMLayer, createView, showMapSpinner, removeMapSpinner, createVectorLayer, createDestinationFeature, handlePointerMove } from './src/geo';
import { SUPPORTED_INSTA_MEDIA_TYPES, MAX_IMAGE_DIMENSION, image_type, carousel_album_type } from './src/constants'


const closerEl = document.getElementById('popup-closer');
const captionEl = document.getElementById('popup-caption');
const imagesEl = document.getElementById('popup-images');
const nextImageEl = document.getElementById('next-image')
const previousImageEl = document.getElementById('previous-image')

const mediaOverlay = createMediaOverlay();

const view = createView();

const destinationsLayer = createVectorLayer()

const map = new Map({
  target: 'map',
  layers: [
    createOSMLayer(),
    destinationsLayer
  ],
  view: view,
  overlays: [
    mediaOverlay
  ],
});

let features = []

map.on("pointermove", handlePointerMove);
map.on("click", handlePointerClick);

// map.on("moveend", (ev) => {
//   // NOTE: for debugging and map configuration
//   console.log(map.getView().getZoom())
//   console.log(map.getView().getCenter())
// });


async function initApp() {
  showMapSpinner(map)
  const posts = await getPosts()
  features = new Collection(posts.map(post => createDestinationFeature(post)))
  destinationsLayer.setSource(new VectorSource({ features }))
  removeMapSpinner(map)
}

// FIXME Window.onload ?
await initApp()

// loading spinner
// map.on('loadstart', function() {
//   showSpinner(map)
// });
// map.on('loadend', function() {
//   removeMapSpinner(map)
// });

async function handlePointerClick(ev) {
  const feature = this.getFeaturesAtPixel(ev.pixel)[0]
  if (feature) {
    const { coordinates, ...rest } = getFeatureData(feature)
    await movements.driveTo(coordinates, view)

    await showMediaOverlay({ coordinates, ...rest })
  }
}

function closeOverlay() {
  clearOverlay()
  mediaOverlay.setPosition(undefined);
  closerEl.blur();
  // {boolean} Don't follow the href.
  return false;
}

function clearOverlay() { // TODO necessary ?
  captionEl.textContent = ''; // NOTE: faster than innerHTML = ''
  imagesEl.textContent = '';
}


closerEl.onclick = closeOverlay


async function showMediaOverlay({ id, caption, media_type, media_url, coordinates }) {
  captionEl.textContent = caption
  mediaOverlay.setPosition(coordinates);

  let imagesCount = 0
  if (SUPPORTED_INSTA_MEDIA_TYPES.includes(media_type)) {
    const overlayMargin = 0.1
    const imgMargin = 2

    const img_size = Math.min(
      (window.innerWidth * (1 - overlayMargin)),
      (window.innerHeight / 2 * (1 - overlayMargin)),
      MAX_IMAGE_DIMENSION + (2 * imgMargin)
    )

    let mediaItems = []
    if (media_type === image_type) {
      imagesCount = 1
      mediaItems = [{ id, media_type, media_url }]
    }
    if (media_type === carousel_album_type) {
      mediaItems = await getPostItems(id)
    }
    const imgUrls = getMediaUrls(mediaItems)

    imagesCount = imgUrls.length
    const allImagesWidth = imagesCount * img_size
    const elMaxWidth = window.innerWidth * (1 - overlayMargin)
    let width = allImagesWidth
    if (allImagesWidth > elMaxWidth) {
      imagesEl.style.overflowX = 'scroll';
      imagesEl.onscroll = (ev) => {
        setCarouselPreviousVisibility(ev.target, previousImageEl)
        setCarouselNextVisibility(ev.target, nextImageEl)
      }
      width = elMaxWidth
      nextImageEl.onclick = async () => await carouselNext(imagesEl, img_size)
      previousImageEl.onclick = async () => await carouselPrevious(imagesEl, img_size)
    } else {
      imagesEl.style.overflowX = 'hidden';
    }

    mediaOverlay.getElement().style.width = `${width}px`

    const imageCollectionResult = await createImageCollectionElement(img_size, imagesEl, imgUrls);
    // TODO display image load errors / timeouts
  }
  return imagesCount
}


function getFeatureCoordinates(feature) {
  return feature.getGeometry().getCoordinates()
}

function getFeatureData(feature) {
  const coordinates = getFeatureCoordinates(feature)
  return { coordinates, ...feature.getProperties() }
}

let arrived = null
async function next(index) {
  if (index < features.getLength()) {
    const { coordinates, ...rest } = getFeatureData(features.item(index))
    if (index === 0) {
      arrived = await movements.driveTo(coordinates, view);
      onTravelStart()
    } else {
      const currentCoordinates = view.getCenter()
      const { symbol, azimuthCorrection, move, zoom } = choseVehicle(currentCoordinates, coordinates)

      await zoomTo(zoom, view)

      const azimuthRad = turnTowards(currentCoordinates, coordinates, azimuthCorrection)
      vehicleEl.textContent = symbol
      vehicleEl.style.transform = `rotate(${azimuthRad}rad)`

      await wait(1000) // TODO transition is set to 1s. Set as css constant (less?)

      arrived = await move(coordinates, view);
      vehicleEl.textContent = ''
    }
    if (!arrived) {
      arrived = 'cancelled 😭'
      return Promise.resolve('cancelled')
    }
    const imagesCount = await showMediaOverlay({ coordinates, ...rest })
    // TODO wrap scroll event in promise

    // for (let i = 0; i < cars.length; i++) {
    //   // Autoscroll
    //   nextImageEl.click()
    // }

    await wait(2000)
    closeOverlay()
    await next(index + 1);
  } else {
    arrived = 'complete 🙌'
  }
}

async function travel() {
  initTravel()

  if (!features) {
    Promise.reject(new Error('no post features'))
  }

  await next(0)

  onTravelEnd(arrived)
}

// TODO move to controls.js

const travelEl = document.getElementById('travel');
const vehicleEl = document.getElementById('vehicle');
const cancelEl = document.getElementById('cancel');

function initTravel() {
  map.getInteractions().forEach(interaction => {
    // TODO move to module
    interaction.setActive(false)
  })
  map.getControls().forEach(control => {
    control.setMap(null)
  })

  travelEl.style.display = 'none'
  cancelEl.style.display = 'block'
}

function onTravelStart() {
  vehicleEl.style.zIndex = 1
}

function onTravelEnd(arrived) {
  map.getInteractions().forEach(interaction => {
    interaction.setActive(true)
  })
  map.getControls().forEach(control => {
    control.setMap(map)
  })

  vehicleEl.style.zIndex = -1
  cancelEl.style.display = 'none'
  travelEl.style.display = 'block'
  alert(`Tour ${arrived}`)
}

function cancel() {
  map.getView().cancelAnimations()
  console.log(map.getView())
}

travelEl.onclick = travel
cancelEl.onclick = cancel

