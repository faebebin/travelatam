import './style.css';
import { Map } from 'ol';
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

const mediaOverlay = createMediaOverlay();

const view = createView();

const [destinationsSource, destinationsLayer] = createVectorLayer()

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


map.on("pointermove", handlePointerMove);
map.on("click", handleDestinationClick);

showMapSpinner(map)

let posts = []

async function initApp() {
  const posts = await getPosts()
  const destinations = posts.map(post => createDestinationFeature(post))
  destinationsSource.addFeatures(destinations)
  removeMapSpinner(map)
  return posts
}

// FIXME Window.onload ?
posts = await initApp()

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

let play = null // null | 'playing' | 'paused'
const initTourContent = tourEl.textContent

function resumeTour() {
  play = 'playing'
  tourEl.textContent = '⏸️  Pause'
  onClick('tour', pauseTour)
}

function pauseTour() {
  play = 'paused'
  tourEl.textContent = '▶️  Play'
  onClick('tour', resumeTour)
}

function onTourStart() {
  play = 'playing'
  interactions.forEach(interaction => {
    // TODO move to module
    interaction.setActive(false)
  })
  controls.forEach(control => {
    control.setMap(null)
  })
  tourEl.textContent = '⏸️  Pause'

  cancelEl.style.display = 'block'
  onClick('tour', pauseTour)
}

function onTourEnd() {
  interactions.forEach(interaction => {
    interaction.setActive(true)
  })
  controls.forEach(control => {
    control.setMap(map)
  })

  cancelEl.style.display = 'none'
  tourEl.textContent = initTourContent
  onClick('tour', tour);
}

async function handleDestinationClick(ev) {
  const feature = this.getFeaturesAtPixel(ev.pixel)[0]
  if (feature) {
    const coordinates = feature.getGeometry().getCoordinates()
    await moveTo(coordinates)
    await showMediaOverlay({ coordinates, ...feature.getProperties() })
  }
}


async function showMediaOverlay({ id, caption, media_type, media_url, coordinates }) { // TODO just pass feature instead
  captionEl.textContent = caption
  mediaOverlay.setPosition(coordinates);

  if (SUPPORTED_INSTA_MEDIA_TYPES.includes(media_type)) {
    const imgMargin = 0.1
    const img_size = Math.min(
      (window.innerWidth * (1 - imgMargin)),
      (window.innerHeight / 2 * (1 - imgMargin)),
      MAX_IMAGE_DIMENSION
    )

    let mediaItems = []
    if (media_type === image_type) {
      mediaItems = [{ id, caption, media_type, media_url, coordinates }]
    }
    if (media_type === carousel_album_type) {
      mediaItems = await getPostItems(id)
    }
    const imgUrls = getMediaUrls(mediaItems)

    const width = Math.min(
      (imgUrls.length * img_size),
      window.innerWidth * (1 - imgMargin)
    )
    mediaOverlay.getElement().style.width = `${width}px`

    const imageCollectionResult = await createImageCollectionElement(img_size, imagesEl, imgUrls);
    // TODO display image load errors / timeouts
  }
}

async function tour() {
  onTourStart()
  let arrived = true

  for await (const [index, post] of posts.entries()) {
    // TODO just iterate map.features instead? (using collecion?)
    const { id, coordinates, caption, media_type, media_url } = post
    arrived = await flyTo(coordinates);

    if (!arrived) break

    if (play === 'paused') {
      confirm('▶️  Resume tour')
      play = 'playing'
    }

    await showMediaOverlay({ id, coordinates, caption, media_type, media_url })

    await wait(2000)
    closeOverlay()

    // TODO for debugging
    // if (index > 0) break
  }

  onTourEnd()

  if (!arrived) {
    return alert('Tour cancelled');
  }
  alert('Tour complete');
}

function cancel() {
  view.cancelAnimations()
  alert('Tour cancelled');
  onClick('tour', tour);
  tourEl.textContent = initTourContent
}

onClick('tour', tour);
onClick('cancel', cancel);

