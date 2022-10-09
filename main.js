import './style.css';
import { Map, View, Overlay } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { easeIn, easeOut } from 'ol/easing';
import { fromLonLat } from 'ol/proj';
import { getMediaUrls } from './helpers/media'

const zurichAirport = fromLonLat([47.459, 8.5474].reverse());
const madridAirport = fromLonLat([40.4989, -3.5748].reverse());
const medellinAirport = fromLonLat([6.167265, -75.423193].reverse());
const cartagenaAirport = fromLonLat([10.446947, -75.512570].reverse());
const cartagenaHostalRepublica = fromLonLat([10.425705, -75.548614].reverse());

// Yes, I hardcoded my shortlived readonly insta api token for this frontend-only POC :D
// But if you want to see my insta media, rather just connect with me, I will accept ;)
const INSTA_API_TOKEN = 'IGQVJVREFMaWVpQjMtMmFweEw1TW5TSDNYTFZA0LW5qS3BVS0lmRkprVzhWRzZAfckxVaG5GX1RaQlF0N2w2dnNLU1V6U1hLM09LRkoxQVh3MENFQ3FCQWkwOE9ER3I5Rll3M3Uya3JB'

// all fields: caption,id,media_type,media_url,permalink,thumbnail_url,timestamp,username

// Add a location or coordinates per post/album in the form "travelatam[lat,lon]"
// The client will make a stop there and request and display the photos.
//
// TODO: https://www.npmjs.com/package/node-geocoder
// get coordinates from location name

const CAROUSEL_ALBUM_FIELDS = 'id,caption'
async function getPosts() {
  // Posts / Albums / Carousel Albums (eg Bogota)
  fetch(`https://graph.instagram.com/me/media?fields=${CAROUSEL_ALBUM_FIELDS}&access_token=${INSTA_API_TOKEN}`)
    .then(response => response.json())
    .then(data => console.log(data))
}

// TODO read Posts captions
//  for each caption containing '[\d,\d]'
//    get lat,lon and id
//
//      with id => getPostItems
//        for each item 
//          with media_url create popup with <img url=media_url
//
//   fly to next lat,lon :)

async function getPostItems() {
  const mediaId = '17988232330581426'
  const fields = 'media_type,media_url'
  const url = `https://graph.instagram.com/${mediaId}/children?fields=${fields}&access_token=${INSTA_API_TOKEN}`
  const response = await fetch(url)
  // TODO if !response.ok { return text}
  const json = await response.json()
  return getMediaUrls(json.data)
}

/* ======================
  * OL-Map
  */

const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

const overlay = new Overlay({
  element: container,
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

map.on('singleclick', async function(evt) {
  const img_url = await getPostItems()
  content.innerHTML = `<img height=100 width=100 src=${img_url}>`;
  overlay.setPosition(evt.coordinate);
});

closer.onclick = function() {
  overlay.setPosition(undefined);
  closer.blur();
  // {boolean} Don't follow the href.
  return false;
};

/* ======================
  * Movements
  */

// A bounce easing method (from https://github.com/DmitryBaranovskiy/raphael).
function bounce(t) {
  const s = 7.5625;
  const p = 2.75;
  let l;
  if (t < 1 / p) {
    l = s * t * t;
  } else {
    if (t < 2 / p) {
      t -= 1.5 / p;
      l = s * t * t + 0.75;
    } else {
      if (t < 2.5 / p) {
        t -= 2.25 / p;
        l = s * t * t + 0.9375;
      } else {
        t -= 2.625 / p;
        l = s * t * t + 0.984375;
      }
    }
  }
  return l;
}

// An elastic easing method (from https://github.com/DmitryBaranovskiy/raphael).
function elastic(t) {
  return (
    Math.pow(2, -10 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1
  );
}

function onClick(id, callback) {
  document.getElementById(id)?.addEventListener('click', callback);
}

function flyTo(location, done) {
  const duration = 2000;
  const zoom = view.getZoom();
  let parts = 2;
  let called = false;
  function callback(complete) {
    --parts;
    if (called) {
      return;
    }
    if (parts === 0 || !complete) {
      called = true;
      done(complete);
    }
  }
  view.animate(
    {
      center: location,
      duration: duration,
    },
    callback
  );
  view.animate(
    {
      zoom: zoom - 1,
      duration: duration / 2,
    },
    {
      zoom: zoom,
      duration: duration / 2,
    },
    callback
  );
}

function tour() {
  const locations = [zurichAirport, madridAirport, medellinAirport, cartagenaAirport, cartagenaHostalRepublica];
  let index = -1;
  function next(more) {
    if (more) {
      ++index;
      if (index < locations.length) {
        const delay = index === 0 ? 0 : 750;
        setTimeout(function() {
          flyTo(locations[index], next);
        }, delay);
      } else {
        alert('Tour complete');
      }
    } else {
      alert('Tour cancelled');
    }
  }
  next(true);
}

onClick('tour', tour);

// Further moves ... ========================================
//

onClick('fly-to-bern', function() {
  flyTo(cartagenaHostalRepublica, function() { });
});


onClick('rotate-left', function() {
  view.animate({
    rotation: view.getRotation() + Math.PI / 2,
  });
});

onClick('rotate-right', function() {
  view.animate({
    rotation: view.getRotation() - Math.PI / 2,
  });
});

onClick('rotate-around-rome', function() {
  // Rotation animation takes the shortest arc, so animate in two parts
  const rotation = view.getRotation();
  view.animate(
    {
      rotation: rotation + Math.PI,
      anchor: cartagenaAirport,
      easing: easeIn,
    },
    {
      rotation: rotation + 2 * Math.PI,
      anchor: cartagenaAirport,
      easing: easeOut,
    }
  );
});

onClick('pan-to-london', function() {
  view.animate({
    center: zurichAirport,
    duration: 2000,
  });
});

onClick('elastic-to-moscow', function() {
  view.animate({
    center: madridAirport,
    duration: 2000,
    easing: elastic,
  });
});

onClick('bounce-to-istanbul', function() {
  view.animate({
    center: medellinAirport,
    duration: 2000,
    easing: bounce,
  });
});

onClick('spin-to-rome', function() {
  // Rotation animation takes the shortest arc, so animate in two parts
  const center = view.getCenter();
  view.animate(
    {
      center: [
        center[0] + (cartagenaAirport[0] - center[0]) / 2,
        center[1] + (cartagenaAirport[1] - center[1]) / 2,
      ],
      rotation: Math.PI,
      easing: easeIn,
    },
    {
      center: cartagenaAirport,
      rotation: 2 * Math.PI,
      easing: easeOut,
    }
  );
});

