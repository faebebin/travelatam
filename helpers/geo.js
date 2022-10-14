import { fromLonLat } from 'ol/proj'
import TileLayer from 'ol/layer/Tile';
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Point from 'ol/geom/Point';
import OSM from 'ol/source/OSM';
import { View, Overlay, Feature } from 'ol';
import { Style, RegularShape, Fill, Stroke } from "ol/style";


export async function getOSMLatLonFromNames(osmSearchTerms) {
  // eg: https://nominatim.openstreetmap.org/search?q=bogota,+colombia&format=json
  const searchParams = toNominatimSearchParams(osmSearchTerms)
  const url = `https://nominatim.openstreetmap.org/search?q=${searchParams}&format=json`
  const response = await fetch(url)
  // TODO if !response.ok { return text}
  const json = await response.json()
  const data = json[0]
  if (!data) return null // TODO msg: Location not found
  const lat = data.lat
  const lon = data.lon
  return [lat, lon]
}

export function toNominatimSearchParams(osmSearchTerms) {
  // FIXME only exported for testing. Try https://github.com/jhnns/rewire with vitest?
  // return Object.values(arguments).join(',+')
  return osmSearchTerms.replace(/,/g, ',+')
}

export function createOSMLayer() {
  return new TileLayer({
    preload: 4,
    source: new OSM(),
  })
}

export function createVectorLayer() {
  const stroke = new Stroke({ color: 'black', width: 2 });
  const fill = new Fill({ color: 'red' });
  const starShape = new Style({
    image: new RegularShape({
      fill: fill,
      stroke: stroke,
      points: 5,
      radius: 10,
      radius2: 4,
      angle: 0,
    }),
  })
  const destinationsSource = new VectorSource({
  });
  const destinationsLayer = new VectorLayer({
    source: destinationsSource,
    style: starShape
  });
  return [destinationsSource, destinationsLayer]
}

export function createDestinationFeature(coordinates) {
  return new Feature({
    geometry: new Point(coordinates),
  });
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
  const zurichAirport = fromLonLat([47.459, 8.5474].reverse());
  return new View({
    center: zurichAirport,
    zoom: 6,
  })
}

export function showMapSpinner(map) {
  map.getTargetElement().classList.add('spinner');
}
export function removeMapSpinner(map) {
  map.getTargetElement().classList.remove('spinner');
}

export function handlePointerMove(ev) {
  // Only emit `onHover` event when no buttons are pressed, to avoid
  // unexpected behavior on touch devices, when there is a slight
  if (ev.originalEvent.buttons === 0) {
    if (this.hasFeatureAtPixel(ev.pixel)) {
      this.getTargetElement().style.cursor = 'pointer';
    } else {
      this.getTargetElement().style.cursor = '';
    }
  }
}

