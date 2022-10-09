import './style.css';
import { Map, View, Overlay } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { getPostItems } from './helpers/media'
import { createImageCollectionElement } from './helpers/htmlElements'

const zurichAirport = fromLonLat([47.459, 8.5474].reverse());
const madridAirport = fromLonLat([40.4989, -3.5748].reverse());
const medellinAirport = fromLonLat([6.167265, -75.423193].reverse());
const cartagenaAirport = fromLonLat([10.446947, -75.512570].reverse());
const cartagenaHostalRepublica = fromLonLat([10.425705, -75.548614].reverse());


// TODO read Posts captions
//  for each caption containing '[\d,\d]'
//    get lat,lon and id
//
//      with id => getPostItems
//        for each item 
//          with media_url create popup with <img url=media_url
//
//   fly to next lat,lon :)

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
  const img_urls = await getPostItems()
  content.innerHTML = createImageCollectionElement(img_urls);
  overlay.setPosition(evt.coordinate);
});

closer.onclick = function() {
  overlay.setPosition(undefined);
  closer.blur();
  // {boolean} Don't follow the href.
  return false;
};

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

