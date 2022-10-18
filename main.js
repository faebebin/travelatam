import './style.css';
import { Collection, Map } from 'ol';
import VectorSource from "ol/source/Vector";
import { getMediaUrls, getPostItems, getPosts } from './helpers/media'
import { createImageCollectionElement } from './helpers/htmlElements'
import { wait, animate } from './utils/promisify'
import { createMediaOverlay, createOSMLayer, createView, showMapSpinner, removeMapSpinner, createVectorLayer, createDestinationFeature, handlePointerMove } from './helpers/geo';

// TODO typescript anyway
const image_type = 'IMAGE'
const carousel_album_type = 'CAROUSEL_ALBUM'
const SUPPORTED_INSTA_MEDIA_TYPES = [image_type, carousel_album_type]
const MAX_IMAGE_DIMENSION = 300
// TODO if (item.media_type === 'VIDEO') { thumbnail_url


const closerEl = document.getElementById('popup-closer');
const captionEl = document.getElementById('popup-caption');
const imagesEl = document.getElementById('popup-images');
const cancelEl = document.getElementById('cancel');
const tourEl = document.getElementById('tour');
const vehicleEl = document.getElementById('vehicle');

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

async function initApp() {
  showMapSpinner(map)
  const posts = await getPosts()
  features = new Collection(posts.map(post => createDestinationFeature(post)))
  destinationsLayer.setSource(new VectorSource({ features }))
  removeMapSpinner(map)
  console.log(destinationsLayer.getSource().getFeaturesCollection())
}

// FIXME Window.onload ?
await initApp()

const interactions = map.getInteractions()
const controls = map.getControls()

// loading spinner
// map.on('loadstart', function() {
//   showSpinner(map)
// });
// map.on('loadend', function() {
//   removeMapSpinner(map)
// });

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

closerEl.onclick = function() {
  closeOverlay()
};

function onClick(id, callback) {
  document.getElementById(id)?.addEventListener('click', callback);
}

async function moveTo(location) {
  await animate(view,
    {
      center: location,
      duration: 1000,
    }
  )
}

async function flyTo(location) {
  const duration = 2000;
  const zoom = view.getZoom();


  try {
    const horizontalMove = animate(view,
      {
        center: location,
        duration: duration,
      }
    );
    const verticalMove = animate(view,
      {
        zoom: zoom - 1,
        duration: duration / 2,
      },
      {
        zoom: zoom,
        duration: duration / 2,
      }
    );
    await Promise.all([horizontalMove, verticalMove])
    return true
  } catch (error) {
    if (error === 'cancelled') {
      return false
    }
    throw new Error(error)
  }
}

const initTourContent = tourEl.textContent

function onTourStart() {
  interactions.forEach(interaction => {
    // TODO move to module
    interaction.setActive(false)
  })
  controls.forEach(control => {
    control.setMap(null)
  })
  vehicleEl.style.zIndex = 1
  vehicleEl.style.transform = 'rotate(225deg)' /* west facing */


  tourEl.style.display = 'none'

  cancelEl.style.display = 'block'
}

function onTourEnd() {
  interactions.forEach(interaction => {
    interaction.setActive(true)
  })
  controls.forEach(control => {
    control.setMap(map)
  })

  vehicleEl.style.display = 'none'
  cancelEl.style.display = 'none'
  tourEl.textContent = initTourContent
  onClick('tour', tour);
}

async function handlePointerClick(ev) {
  const feature = this.getFeaturesAtPixel(ev.pixel)[0]
  if (feature) {
    const { coordinates, ...rest } = getFeatureData(feature)
    await moveTo(coordinates)
    await showMediaOverlay({ coordinates, ...rest })
  }
}


async function showMediaOverlay({ id, caption, media_type, media_url, coordinates }) {
  captionEl.textContent = caption
  mediaOverlay.setPosition(coordinates);

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
      mediaItems = [{ id, media_type, media_url }]
    }
    if (media_type === carousel_album_type) {
      mediaItems = await getPostItems(id)
    }
    const imgUrls = getMediaUrls(mediaItems)

    const allImagesWidth = imgUrls.length * img_size
    const elMaxWidth = window.innerWidth * (1 - overlayMargin)
    let width = allImagesWidth
    if (allImagesWidth > elMaxWidth) {
      imagesEl.style.overflowX = 'scroll';
      width = elMaxWidth
    } else {
      imagesEl.style.overflowX = 'hidden';
    }

    mediaOverlay.getElement().style.width = `${width}px`

    const imageCollectionResult = await createImageCollectionElement(img_size, imagesEl, imgUrls);
    // TODO display image load errors / timeouts
  }
}

function vehicleAnimation() {
  const bus = '🚌'
  const airplane = '✈️ '
  const bicycle = '🚲'
}

function getFeatureCoordinates(feature) {
  return feature.getGeometry().getCoordinates()
}

function getFeatureData(feature) {
  const coordinates = getFeatureCoordinates(feature)
  return { coordinates, ...feature.getProperties() }
}

async function tour() {
  onTourStart()

  if (!features) {
    Promise.reject(new Error('no post features'))
  }
  let arrived = true
  let index = -1

  async function next(index) {
    if (index < features.getLength()) {
      const { coordinates, ...rest } = getFeatureData(features.item(index))
      arrived = await flyTo(coordinates);
      if (!arrived) {
        // alert('Tour cancelled');
        return Promise.reject()
      }
      // await showMediaOverlay({ coordinates, ...rest })

      await wait(2000)
      closeOverlay()

    } else {
      onTourEnd()
    }
    await next(index + 1);
  }
  // alert('Tour complete');
  await next(0)
}

function cancel() {
  view.cancelAnimations()
  // alert('Tour cancelled');
  onClick('tour', tour);
  tourEl.textContent = initTourContent
}

onClick('tour', tour);
onClick('cancel', cancel);

