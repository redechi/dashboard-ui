import L from 'mapbox.js';
import _ from 'lodash';
import polyline from 'polyline';

const formatters = require('./formatters');
const mapHelpers = require('./map_helpers');
const stats = require('./stats');

let map;
let pathsLayer;
let markersLayer;
let hardBrakesLayer;
let hardAccelsLayer;
let speedingLayer;

L.mapbox.accessToken = 'pk.eyJ1IjoiYXV0b21hdGljIiwiYSI6IlVGb0RHOTgifQ.uMNDoXZe6UI7NVUkDHJgSQ';

exports.createMap = function() {
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

exports.updateMap = function(trip) {
  if(!trip) {
    return;
  }

  let zoom = map.getZoom();
  let pathStyle = mapHelpers.styleLine(zoom, 'highlight');
  let aIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'aHighlightedIcon');
  let bIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'bHighlightedIcon');
  let speedingLine = mapHelpers.styleLine(zoom, 'speeding');
  let hardBrakeIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'hardBrake');
  let hardAccelIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'hardAccel');

  clearMap();

  if(trip.path) {
    L.polyline(polyline.decode(trip.path), pathStyle).addTo(pathsLayer);

    trip.vehicle_events.forEach((item) => {
      if(item.type === 'hard_brake') {
        hardBrakesLayer.addLayer(L.marker(
          [item.lat, item.lon],
          {icon: hardBrakeIcon, id: trip.id}
        ));
      } else if(item.type === 'hard_accel') {
        hardAccelsLayer.addLayer(L.marker(
          [item.lat, item.lon],
          {icon: hardAccelIcon, id: trip.id}
        ));
      } else if(item.type === 'speeding') {
        let lineOptions = _.extend({id: trip.id}, speedingLine);
        speedingLayer.addLayer(L.polyline(item.path, lineOptions));
      }
    });
  }

  if(trip.start_location) {
    L.marker(
      [trip.start_location.lat, trip.start_location.lon],
      {
        icon: aIcon,
        type: 'start',
        id: trip.id
      }
    ).addTo(markersLayer);
  }

  if(trip.end_location) {
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

exports.zoomIn = function() {
  map.zoomIn();
};

exports.zoomOut = function() {
  map.zoomOut();
};

exports.showTripEvents = function() {
  map.addLayer(speedingLayer);
  map.addLayer(hardBrakesLayer);
  map.addLayer(hardAccelsLayer);
};

exports.hideTripEvents = function() {
  map.removeLayer(hardBrakesLayer);
  map.removeLayer(hardAccelsLayer);
  map.removeLayer(speedingLayer);
};

function scaleMarkers() {
  let zoom = map.getZoom();

  let normalIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'normal');
  let hardBrakeIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'hardBrake');
  let hardAccelIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'hardAccel');
  let weight = mapHelpers.getPathWidthbyZoom(zoom);

  pathsLayer.eachLayer((path) => {
    path.setStyle({weight: weight});
  });

  speedingLayer.eachLayer((path) => {
    path.setStyle({weight: weight});
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
  let boundsOptions = {
    padding: [45, 45]
  };

  map.invalidateSize();
  if(!bounds) {
    bounds = pathsLayer.getBounds();
  }
  if(bounds.isValid()) {
    map.fitBounds(bounds, boundsOptions);
  }
}
