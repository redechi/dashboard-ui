import L from 'mapbox.js';
import _ from 'lodash';
import polyline from 'polyline';

const mapHelpers = require('./map_helpers');

let map;
let pathsLayer;
let markersLayer;
let hardBrakesLayer;
let hardAccelsLayer;
let speedingLayer;

L.mapbox.accessToken = 'pk.eyJ1IjoiYXV0b21hdGljIiwiYSI6IlVGb0RHOTgifQ.uMNDoXZe6UI7NVUkDHJgSQ';

function scaleMarkers() {
  const zoom = map.getZoom();
  const hardBrakeIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'hardBrake');
  const hardAccelIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'hardAccel');
  const weight = mapHelpers.getPathWidthbyZoom(zoom);

  pathsLayer.eachLayer((path) => {
    path.setStyle({ weight });
  });

  speedingLayer.eachLayer((path) => {
    path.setStyle({ weight });
  });

  hardBrakesLayer.eachLayer((marker) => {
    marker.setIcon(hardBrakeIcon);
  });

  hardAccelsLayer.eachLayer((marker) => {
    marker.setIcon(hardAccelIcon);
  });
}

function clearMap() {
  pathsLayer.clearLayers();
  markersLayer.clearLayers();
  hardBrakesLayer.clearLayers();
  hardAccelsLayer.clearLayers();
  speedingLayer.clearLayers();
}

function fitBounds(bounds) {
  const boundsOptions = {
    padding: [45, 45]
  };

  map.invalidateSize();
  if (!bounds) {
    bounds = pathsLayer.getBounds();
  }

  if (bounds.isValid()) {
    map.fitBounds(bounds, boundsOptions);
  }
}

exports.createMap = function createMap() {
  map = mapHelpers.createMap('modalMapContainer');
  pathsLayer = L.mapbox.featureLayer();
  markersLayer = L.mapbox.featureLayer();
  hardBrakesLayer = L.mapbox.featureLayer();
  hardAccelsLayer = L.mapbox.featureLayer();
  speedingLayer = L.mapbox.featureLayer();

  map.on('zoomend', scaleMarkers);

  map.addLayer(markersLayer);
  map.addLayer(pathsLayer);
};

exports.updateMap = function updateMap(trip) {
  if (!trip) {
    return;
  }

  const zoom = map.getZoom();
  const pathStyle = mapHelpers.styleLine(zoom, 'highlight');
  const aIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'aHighlightedIcon');
  const bIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'bHighlightedIcon');
  const speedingLine = mapHelpers.styleLine(zoom, 'speeding');
  const hardBrakeIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'hardBrake');
  const hardAccelIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'hardAccel');

  clearMap();

  if (trip.path) {
    L.polyline(polyline.decode(trip.path), pathStyle).addTo(pathsLayer);

    trip.vehicle_events.forEach((item) => {
      if (item.type === 'hard_brake') {
        hardBrakesLayer.addLayer(L.marker(
          [item.lat, item.lon],
          { icon: hardBrakeIcon, id: trip.id }
        ));
      } else if (item.type === 'hard_accel') {
        hardAccelsLayer.addLayer(L.marker(
          [item.lat, item.lon],
          { icon: hardAccelIcon, id: trip.id }
        ));
      } else if (item.type === 'speeding') {
        const lineOptions = _.extend({ id: trip.id }, speedingLine);
        speedingLayer.addLayer(L.polyline(item.path, lineOptions));
      }
    });
  }

  if (trip.start_location) {
    L.marker(
      [trip.start_location.lat, trip.start_location.lon],
      {
        icon: aIcon,
        type: 'start',
        id: trip.id
      }
    ).addTo(markersLayer);
  }

  if (trip.end_location) {
    L.marker(
      [trip.end_location.lat, trip.end_location.lon],
      {
        icon: bIcon,
        type: 'end',
        id: trip.id
      }
    ).addTo(markersLayer);
  }

  fitBounds();
};

exports.zoomIn = function zoomIn() {
  map.zoomIn();
};

exports.zoomOut = function zoomOut() {
  map.zoomOut();
};

exports.showTripEvents = function showTripEvents() {
  map.addLayer(speedingLayer);
  map.addLayer(hardBrakesLayer);
  map.addLayer(hardAccelsLayer);
};

exports.hideTripEvents = function hideTripEvents() {
  map.removeLayer(hardBrakesLayer);
  map.removeLayer(hardAccelsLayer);
  map.removeLayer(speedingLayer);
};
