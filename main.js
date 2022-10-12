import './style.css';
import { Map, View, Overlay } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
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


// FIXME remove and add insta post
const zurichAirport = fromLonLat([47.459, 8.5474].reverse());
const madridAirport = fromLonLat([40.4989, -3.5748].reverse());
const medellinAirport = fromLonLat([6.167265, -75.423193].reverse());
const cartagenaAirport = fromLonLat([10.446947, -75.512570].reverse());
const cartagenaHostalRepublica = fromLonLat([10.425705, -75.548614].reverse());

const overlay = new Overlay({
  element: containerEl,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});

const view = new View({
  center: medellinAirport,
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
  // FIXME remove and add insta posts instead
  let posts = [
    {
      id: null,
      coordinates: zurichAirport,
      caption: "Zürich"
    },
    {
      id: null,
      coordinates: madridAirport,
      caption: "Madrid"
    },
    {
      id: null,
      coordinates: medellinAirport,
      caption: "Medellin"
    },
    {
      id: null,
      coordinates: cartagenaAirport,
      caption: "Cartagena"
    },
    {
      id: null,
      coordinates: cartagenaHostalRepublica,
      caption: "Cartagena, Republica Hostal"
    }
  ]


  const instaPosts = await getPosts()
  // posts.push(...instaPosts)
  posts = instaPosts
  let arrived = true
  let mediaItems = []

  for await (const [index, post] of posts.entries()) {
    const { id, coordinates, caption, media_type } = post
    await wait(index === 0 ? 0 : 750)
    arrived = await flyTo(coordinates);

    if (!arrived) {
      break
    }

    if (SUPPORTED_INSTA_MEDIA_TYPES.includes(media_type)) {
      if (media_type === image_type) {
        mediaItems = [post]
      }
      if (media_type === carousel_album_type) {
        mediaItems = await getPostItems(id)
      }
      console.log(caption)
      console.log(mediaItems)
      const imgUrls = getMediaUrls(mediaItems)
      console.log(imgUrls)
      captionEl.innerHTML = caption
      overlay.setPosition(coordinates);
      const imageCollectionResult = await createImageCollectionElement(imagesEl, imgUrls);
      // TODO display image load errors / timeouts
      await wait(3000)
      closeOverlay()
    }
  }

  if (!arrived) {
    return alert('Tour cancelled');
  }
  alert('Tour complete');
}

onClick('tour', tour);

