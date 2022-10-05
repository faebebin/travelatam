import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {easeIn, easeOut} from 'ol/easing';
import {fromLonLat} from 'ol/proj';

const zurichAirport = fromLonLat([47.459, 8.5474].reverse());
const madridAirport = fromLonLat([40.4989, -3.5748].reverse());
const medellinAirport = fromLonLat([6.167265, -75.423193].reverse());
const cartagenaAirport = fromLonLat([10.446947, -75.512570].reverse());
const cartagenaHostalRepublica = fromLonLat([10.425705, -75.548614].reverse());

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
});

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
  document.getElementById(id).addEventListener('click', callback);
}

onClick('rotate-left', function () {
  view.animate({
    rotation: view.getRotation() + Math.PI / 2,
  });
});

onClick('rotate-right', function () {
  view.animate({
    rotation: view.getRotation() - Math.PI / 2,
  });
});

onClick('rotate-around-rome', function () {
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

onClick('pan-to-london', function () {
  view.animate({
    center: zurichAirport,
    duration: 2000,
  });
});

onClick('elastic-to-moscow', function () {
  view.animate({
    center: madridAirport,
    duration: 2000,
    easing: elastic,
  });
});

onClick('bounce-to-istanbul', function () {
  view.animate({
    center: medellinAirport,
    duration: 2000,
    easing: bounce,
  });
});

onClick('spin-to-rome', function () {
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

onClick('fly-to-bern', function () {
  flyTo(cartagenaHostalRepublica, function () {});
});

function tour() {
  const locations = [zurichAirport, madridAirport, medellinAirport, cartagenaAirport, cartagenaHostalRepublica];
  let index = -1;
  function next(more) {
    if (more) {
      ++index;
      if (index < locations.length) {
        const delay = index === 0 ? 0 : 750;
        setTimeout(function () {
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
