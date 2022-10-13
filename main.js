import './style.css';
import { Map, View, Overlay } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { getMediaUrls, getPostItems, getPosts } from './helpers/media'
import { createImageCollectionElement } from './helpers/htmlElements'
import { wait, animate } from './utils/promisify'

// TODO typescript anyway
const image_type = 'IMAGE'
const carousel_album_type = 'CAROUSEL_ALBUM'
const SUPPORTED_INSTA_MEDIA_TYPES = [image_type, carousel_album_type]
// TODO if (item.media_type === 'VIDEO') { thumbnail_url


const containerEl = document.getElementById('popup');
const closerEl = document.getElementById('popup-closer');
const captionEl = document.getElementById('popup-caption');
const imagesEl = document.getElementById('popup-images');

const zurichAirport = fromLonLat([47.459, 8.5474].reverse());

const overlay = new Overlay({
  element: containerEl,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});

const view = new View({
  center: zurichAirport,
  zoom: 6,
});

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      preload: 4,
      source: new OSM(),
    }),
  ],
  view: view,
  overlays: [overlay],
});

function closeOverlay() {
  clearOverlay()
  overlay.setPosition(undefined);
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

async function tour() {
  const posts = await getPosts()
  let arrived = true
  let mediaItems = []

  for await (const [index, post] of posts.entries()) {
    const { id, coordinates, caption, media_type } = post
    arrived = await flyTo(coordinates);

    if (!arrived) {
      break
    }

    captionEl.innerHTML = caption
    overlay.setPosition(coordinates);

    if (SUPPORTED_INSTA_MEDIA_TYPES.includes(media_type)) {
      if (media_type === image_type) {
        mediaItems = [post]
      }
      if (media_type === carousel_album_type) {
        mediaItems = await getPostItems(id)
      }
      const imgUrls = getMediaUrls(mediaItems)
      const imageCollectionResult = await createImageCollectionElement(imagesEl, imgUrls);
      // TODO display image load errors / timeouts
    }

    await wait(2000)
    closeOverlay()
  }

  if (!arrived) {
    return alert('Tour cancelled');
  }
  alert('Tour complete');
}

onClick('tour', tour);

