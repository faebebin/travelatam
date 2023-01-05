import TileLayer from 'ol/layer/Tile';
import { getDistance } from 'ol/sphere';
import { toLonLat } from 'ol/proj';
import VectorLayer from "ol/layer/Vector";
import OSM from 'ol/source/OSM';
import { View, Overlay } from 'ol';
import { Style, RegularShape, Fill, Stroke } from "ol/style";


export function createOSMLayer() {
  return new TileLayer({
    preload: 4,
    source: new OSM(),
  })
}

export function createVectorLayer() {
  const stroke = new Stroke({ color: 'black', width: 2 });
  const fill = new Fill({ color: 'red' });
  const star = new Style({
    image: new RegularShape({
      fill: fill,
      stroke: stroke,
      points: 5,
      radius: 10,
      radius2: 4,
      angle: 0,
    }),
  })
  return new VectorLayer({ style: star });
}

export function greatCircleDistance(coordinatesA, coordinatesB) {
  return getDistance(toLonLat(coordinatesA), toLonLat(coordinatesB))
}

export function createMediaOverlay() {
  const el = document.getElementById('media-popup');
  return new Overlay({
    element: el,
    autoPan: {
      animation: {
        duration: 250,
      },
    },
    positioning: 'bottom-center',
    offset: [0, -12]
  })
}

export function createView() {
  const worldCenter = [307065.59275812306, -746078.6820344215];
  return new View({
    center: worldCenter,
    zoom: 2.46,
  })
}

export function showMapSpinner(map) {
  map.getTargetElement().classList.add('spinner');
  document.getElementById('info').style.display = 'block'
  // TODO add message (wg fetching instagram posts)
}
export function removeMapSpinner(map) {
  map.getTargetElement().classList.remove('spinner');
  document.getElementById('info').style.display = 'none'
}

export function handlePointerMove(ev) {
  // Only emit `onHover` event when no buttons are pressed, to avoid
  // unexpected behavior on touch devices, when there is a slight
  if (ev.originalEvent.buttons === 0) {
    if (this.hasFeatureAtPixel(ev.pixel)) {
      this.getTargetElement().style.cursor = 'pointer';
      // TODO show caption
    } else {
      this.getTargetElement().style.cursor = '';
    }
  }
}

// export function urlIfy(string) {
//   return string.trim().replace(/  +/g, ' ').replace(/\s/g, '%20');
// }

// export function extractLocationNames(stringInclNames) {
//   const pattern = /\[[\w\W,]+\]/g;
//   const match = stringInclNames.match(pattern)
//   if (!match) return null
//   // return match[0].replace(/\[|\]/g, '').split(',')
//   return match[0].replace(/\[|\]/g, '')
// }
// 
// export function fromLatLon(latLon) {
//   // To default EPSG:3857
//   if (!Array.isArray(latLon)) {
//     // NOTE: Else strange error '.reverse() not a function' TODO TS
//     return false
//   }
//   return fromLonLat(latLon.reverse())
// }
// 

