import './style.css';
import { Map } from 'ol';
import VectorSource from "ol/source/Vector";
import { carouselNext, carouselPrevious, createImageCollectionElement, setCarouselNextVisibility, setCarouselPreviousVisibility } from './src/image'
import { zoomTo, turnTowards, movements, choseVehicleByDistance, choseVehicleByName } from './src/animate'
import { wait, abortController, scrollEnd } from './utils/promisify'
import { createMediaOverlay, createOSMLayer, createView, showMapSpinner, removeMapSpinner, createVectorLayer, handlePointerMove, greatCircleDistance } from './src/geo';
import { MAX_IMAGE_DIMENSION, image_type, carousel_album_type } from './src/constants'
import NoSleep from 'nosleep.js';
import json from './data/travel_photos'

import GeoJSON from 'ol/format/GeoJSON.js';

const noSleep = new NoSleep();


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
    // createOSMLayer(),
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

map.on("moveend", (ev) => {
  // NOTE: for debugging and map configuration
  console.log(map.getView().getZoom())
  console.log(map.getView().getCenter())
});

const travelEl = document.getElementById('travel');

function initApp() {
  showMapSpinner(map)
  const features = new GeoJSON({ dataProjection: 'EPSG:3857' }).readFeatures(json)
  destinationsLayer.setSource(new VectorSource({ features }))
  removeMapSpinner(map)

  travelEl.style.display = 'block'
}

initApp()

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
    await movements.driveTo(coordinates, 1000, view)

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


async function showMediaOverlay({ id, coordinates, RelPath }) {
  captionEl.textContent = "add meta like altitude, direction ..."
  mediaOverlay.setPosition(coordinates);
  let imagesCount = 0

  const overlayMargin = 0.1
  const imgMargin = 2

  const img_size = Math.min(
    (window.innerWidth * (1 - overlayMargin)),
    (window.innerHeight / 2 * (1 - overlayMargin)),
    MAX_IMAGE_DIMENSION + (2 * imgMargin)
  )

  const imgRelPaths = [RelPath] // TODO generate url arrray in QGIS clustering

  imagesCount = imgRelPaths.length
  const allImagesWidth = imagesCount * img_size
  const elMaxWidth = window.innerWidth * (1 - overlayMargin)
  let width = allImagesWidth
  if (allImagesWidth > elMaxWidth) {
    nextImageEl.style.display = 'block'
    imagesEl.style.overflowX = 'scroll';
    imagesEl.onscroll = (ev) => {
      setCarouselPreviousVisibility(ev.target, previousImageEl)
      setCarouselNextVisibility(ev.target, nextImageEl)
    }
    width = elMaxWidth
    nextImageEl.onclick = () => carouselNext(imagesEl, img_size)
    previousImageEl.onclick = () => carouselPrevious(imagesEl, img_size)
  } else {
    imagesEl.style.overflowX = 'hidden';
  }

  mediaOverlay.getElement().style.width = `${width}px`

  const imageCollectionResult = await createImageCollectionElement(img_size, imagesEl, imgRelPaths);
  // TODO display image load errors / timeouts
  return imagesCount
}


function getFeatureCoordinates(feature) {
  return feature.getGeometry().getCoordinates()
}

function getFeatureData(feature) {
  const coordinates = getFeatureCoordinates(feature)
  return { coordinates, ...feature.getProperties() }
}

async function autoScrollImageCarousel(imagesCount) {
  for (let i = 1; i < imagesCount; i++) {
    // Autoscroll through images carousel
    nextImageEl.click()
    await scrollEnd(imagesEl)
    await wait(1000)
  }
}

let arrived = null
async function next(index) {
  if (index < features.getLength()) {
    const { coordinates, caption, ...rest } = getFeatureData(features.item(index))
    if (index === 0) {
      // TODO start on 1 and get proper zoom upon first move
      arrived = await movements.flyTo(coordinates, 2000, view);
      await zoomTo(6, view)
    } else {
      onTravelStart()
      const currentCoordinates = view.getCenter()
      // TODO move all to processPosts
      const distance = greatCircleDistance(currentCoordinates, coordinates)
      // const { symbol, azimuthCorrection, move, zoom, velocity, mode } = choseVehicleByName(caption) || choseVehicleByDistance(distance)
       const { symbol, azimuthCorrection, move, zoom, velocity, mode } = choseVehicleByDistance(distance)

      await zoomTo(zoom, view)

      const turnTime = 1000
      const azimuthRad = turnTowards(currentCoordinates, coordinates, azimuthCorrection)
      const rotateValue = `rotate(${azimuthRad}rad)`
      vehicleEl.textContent = symbol
      vehicleEl.style.transform = rotateValue
      vehicleEl.style.transition = `transform ${turnTime / 1000}s ease-in-out`

      await wait(turnTime)
      vehicleEl.style.transition = 'none'
      let driveAnimation = null

      if (mode === 'drive') {
        driveAnimation = vehicleEl.animate([
          // keyframes
          { transform: `translate(1px, 1px) ${rotateValue}` },
          { transform: `translate(-1px, -2px) ${rotateValue}` },
          { transform: `translate(-3px, 0px) ${rotateValue}` },
          { transform: `translate(3px, 2px) ${rotateValue}` },
          { transform: `translate(1px, -1px) ${rotateValue}` },
          { transform: `translate(-1px, 2px) ${rotateValue}` },
          { transform: `translate(-3px, 1px) ${rotateValue}` },
          { transform: `translate(3px, 1px) ${rotateValue}` },
          { transform: `translate(-1px, -1px) ${rotateValue}` },
          { transform: `translate(1px, 2px) ${rotateValue}` },
          { transform: `translate(1px, -2px) ${rotateValue}` }
        ], {
          // timing options
          duration: 1000,
          iterations: Infinity
        });
      }

      const duration = distance / velocity
      arrived = await move(coordinates, duration, view);
      vehicleEl.textContent = ''
      driveAnimation?.cancel()
    }
    if (!arrived) {
      // FIXME clean all this up!
      arrived = 'cancelled 😭'
      return Promise.resolve('cancelled')
    }
    const imagesCount = await showMediaOverlay({ coordinates, caption, ...rest })
    // TODO wrap scroll event in promise

    await autoScrollImageCarousel(imagesCount)
    await wait(1000)
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

  try {
    abortController.signal.addEventListener("abort", () => {
      Promise.reject();
    });

    await next(0)
    onTravelEnd('complete 🙌')
  } catch (error) {
    onTravelEnd('cancelled 😭')
  }
}

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
  // Prevent mobile browsers from sleep
  noSleep.enable()
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
  noSleep.disable()
  alert(`Tour ${arrived}`)
}

function cancelTravel() {
  cancelEl.style.display = 'none'
  noSleep.disable()
  map.getView().cancelAnimations()
  abortController.abort()
}

travelEl.onclick = travel
cancelEl.onclick = cancelTravel

