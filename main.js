import './style.css';
import { Map } from 'ol';
import VectorSource from "ol/source/Vector";
import { carouselNext, carouselPrevious, createImageCollectionElement, setCarouselNextVisibility, setCarouselPreviousVisibility } from './src/image'
import { zoomTo, turnTowards, movements, choseVehicleByName } from './src/animate'
import { wait, abortController, scrollEnd } from './utils/promisify'
import { createMediaOverlay, createOSMLayer, createView, showMapSpinner, removeMapSpinner, createVectorLayer, handlePointerMove, greatCircleDistance } from './src/geo';
import { DISPLAY_VELOCITY, MAX_IMAGE_DIMENSION } from './src/constants'
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
    createOSMLayer(),
    destinationsLayer
  ],
  view: view,
  overlays: [
    mediaOverlay
  ],
});

let features = [] // Collection<Feature<Geometry>>

map.on("pointermove", handlePointerMove);
map.on("click", handlePointerClick);

const travelEl = document.getElementById('travel');

function initApp() {
  showMapSpinner(map)
  // NOTE: Just get vector features as ol/Collection somehow.
  // Could also create a collection from json.features ...
  // Moreover, this way useSpatialindex has to be set to false,
  // which improves performance but disables some capabilities 
  // (see https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html)
  const source = new VectorSource({ features: new GeoJSON().readFeatures(json), useSpatialIndex: false })
  destinationsLayer.setSource(source)
  features = source.getFeaturesCollection()

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
  // For debugging
  // console.log('coords:', ev.coordinate)
  // console.log('zoom:', map.getView().getZoom())
  // console.log('map center:', map.getView().getCenter())
  // console.log('projection', map.getView().getProjection())

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


async function showMediaOverlay({ coordinates, caption, PhotosRelPaths }) {
  captionEl.textContent = caption
  mediaOverlay.setPosition(coordinates);
  let imagesCount = 0

  const overlayMargin = 0.1
  const imgMargin = 2

  const img_size = Math.min(
    (window.innerWidth * (1 - overlayMargin)),
    (window.innerHeight / 2 * (1 - overlayMargin)),
    MAX_IMAGE_DIMENSION + (2 * imgMargin)
  )


  imagesCount = PhotosRelPaths.length
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

  const imageCollectionResult = await createImageCollectionElement(img_size, imagesEl, PhotosRelPaths);
  // TODO display image load errors / timeouts
  return imagesCount
}

function getFeatureData(feature) {
  const coordinates = feature.getGeometry().getCoordinates()
  // TODO Add location name
  const { Timestamp, ...rest } = feature.getProperties()
  const caption = (new Date(Timestamp)).toString()
  return { coordinates, caption, ...rest }
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
    const { coordinates, caption, Vehicle, Distance, ...rest } = getFeatureData(features.item(index))
    if (index === 0) {
      // TODO start on 1 and get proper zoom upon first move
      arrived = await movements.flyTo(coordinates, 2000, view);
      await zoomTo(6, view)
    } else {
      onTravelStart()
      const currentCoordinates = view.getCenter()
      // TODO move all to processPosts
      const { symbol, azimuthCorrection, move, zoom, velocity, mode } = choseVehicleByName(Vehicle)

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

      const duration = (Distance / velocity) // in ms 
      arrived = await move(coordinates, 2000, view);
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

