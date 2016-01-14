import L from 'mapbox.js';
import _ from 'lodash';
import polyline from 'polyline';

const highlight = require('./highlight');
const mapHelpers = require('./map_helpers');

let map;
let pathsLayer;
let markersLayer;
let hardBrakesLayer;
let hardAccelsLayer;
let speedingLayer;
let autozoom;

L.mapbox.accessToken = 'pk.eyJ1IjoiYXV0b21hdGljIiwiYSI6IlVGb0RHOTgifQ.uMNDoXZe6UI7NVUkDHJgSQ';

function scaleMarkers() {
  const zoom = map.getZoom();
  const normalIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'normal');
  const hardBrakeIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'hardBrake');
  const hardAccelIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'hardAccel');
  const weight = mapHelpers.getPathWidthbyZoom(zoom);

  markersLayer.eachLayer((marker) => {
    if (!marker.options.selected) {
      marker.setIcon(normalIcon);
    }
  });

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
  map = mapHelpers.createMap('overviewMapContainer');
  pathsLayer = L.mapbox.featureLayer();
  markersLayer = L.mapbox.featureLayer();
  hardBrakesLayer = L.mapbox.featureLayer();
  hardAccelsLayer = L.mapbox.featureLayer();
  speedingLayer = L.mapbox.featureLayer();

  map.on('zoomend', scaleMarkers);

  map.addLayer(markersLayer);
  map.addLayer(pathsLayer);
};

exports.updateMap = function updateMap(trips, toggleSelect) {
  if (!trips) {
    return;
  }

  const zoom = map.getZoom();
  let pathStyle;
  let aIcon;
  let bIcon;
  const speedingLine = mapHelpers.styleLine(zoom, 'speeding');
  const hardBrakeIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'hardBrake');
  const hardAccelIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'hardAccel');

  clearMap();

  trips.forEach(trip => {
    if (trip.selected) {
      pathStyle = mapHelpers.styleLine(zoom, 'selected');
      aIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'aSelectedIcon');
      bIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'bSelectedIcon');
    } else {
      pathStyle = mapHelpers.styleLine(zoom);
      aIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'normal');
      bIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'normal');
    }

    if (trip.path) {
      const line = L.polyline(polyline.decode(trip.path), pathStyle).addTo(pathsLayer);
      trip.pathID = line._leaflet_id;

      line.on('click', () => {
        toggleSelect(trip.id);
      })
      .on('mouseover', () => {
        highlight.highlightTrips([trip]);
      })
      .on('mouseout', () => {
        highlight.unhighlightTrips();
      });

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
      const startMarker = L.marker(
        [trip.start_location.lat, trip.start_location.lon],
        {
          icon: aIcon,
          type: 'start',
          id: trip.id
        }
      ).addTo(markersLayer);
      trip.startMarkerID = startMarker._leaflet_id;
    }

    if (trip.end_location) {
      const endMarker = L.marker(
        [trip.end_location.lat, trip.end_location.lon],
        {
          icon: bIcon,
          type: 'end',
          id: trip.id
        }
      ).addTo(markersLayer);
      trip.endMarkerID = endMarker._leaflet_id;
    }
  });

  if (speedingLayer.getLayers().length) {
    speedingLayer.bringToFront();
  }

  fitBounds();
};

exports.setAutozoom = function setAutozoom(value) {
  autozoom = value;
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

function getBoundsFromTrips(trips) {
  return trips.reduce((memo, trip) => {
    const path = pathsLayer.getLayer(trip.pathID);
    if (path) {
      const pathBounds = path.getBounds();
      if (!memo) {
        memo = pathBounds;
      } else {
        memo.extend(pathBounds);
      }
    }

    return memo;
  }, null);
}

function zoomTrips(trips) {
  fitBounds(getBoundsFromTrips(trips) || pathsLayer.getBounds());
}

exports.highlightTrips = function highlightTrips(trips) {
  const zoom = map.getZoom();
  const pathStyle = mapHelpers.styleLine(zoom, 'highlight');
  const aIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'aHighlightedIcon');
  const bIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'bHighlightedIcon');

  trips.forEach(trip => {
    const path = pathsLayer.getLayer(trip.pathID);
    const startMarker = markersLayer.getLayer(trip.startMarkerID);
    const endMarker = markersLayer.getLayer(trip.endMarkerID);

    if (path) {
      path
        .bringToFront()
        .setStyle(pathStyle);
    }

    if (startMarker) {
      startMarker.setIcon(aIcon);
    }

    if (endMarker) {
      endMarker.setIcon(bIcon);
    }
  });

  if (speedingLayer.getLayers().length) {
    speedingLayer.bringToFront();
  }

  if (autozoom) {
    zoomTrips(trips);
  }
};

exports.unhighlightTrips = function unhighlightTrips(trips) {
  const zoom = map.getZoom();
  let pathStyle;
  let aIcon;
  let bIcon;

  trips.forEach(trip => {
    const path = pathsLayer.getLayer(trip.pathID);
    const startMarker = markersLayer.getLayer(trip.startMarkerID);
    const endMarker = markersLayer.getLayer(trip.endMarkerID);

    if (trip.selected) {
      pathStyle = mapHelpers.styleLine(zoom, 'selected');
      aIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'aSelectedIcon');
      bIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'bSelectedIcon');
    } else {
      pathStyle = mapHelpers.styleLine(zoom);
      aIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'normal');
      bIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'normal');
    }

    if (path) {
      path
        .bringToFront()
        .setStyle(pathStyle);
    }

    if (startMarker) {
      startMarker.setIcon(aIcon);
    }

    if (endMarker) {
      endMarker.setIcon(bIcon);
    }
  });

  if (autozoom) {
    fitBounds();
  }
};
