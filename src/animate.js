import { animate } from '../utils/promisify'
import { toLonLat } from 'ol/proj';
import { getDistance } from 'ol/sphere';

async function flyTo(location, view) {
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
        zoom: zoom - 1.5,
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

async function driveTo(location, view) {
  try {
    await animate(view,
      {
        center: location,
        duration: 1000,
      }
    )
    return true
  } catch (error) {
    if (error === 'cancelled') {
      return false
    }
    throw new Error(error)
  }

}

export const movements = {
  flyTo,
  driveTo
}

export function turnTowards(current, destination, azimuthCorrection) {
  const azimuthRad = Math.atan2(destination[0] - current[0], destination[1] - current[1])
  return azimuthRad + azimuthCorrection
}

export function vehicleByDistance(current, destination, vehicleConfig) { // Vehicle
  const airDistance = getDistance(toLonLat(current), toLonLat(destination))
  return vehicleConfig.find((vehicle) => airDistance <= vehicle.maxDistance)
}

/*
import { easeIn, easeOut } from 'ol/easing';


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
*/
