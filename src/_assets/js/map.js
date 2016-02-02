import L from 'mapbox.js';
import _ from 'lodash';
import polyline from 'polyline';

const highlight = require('./highlight');
const mapHelpers = require('./map_helpers');
const select = require('./select');

let map;
let pathsLayer;
let markersLayer;
let hardBrakesLayer;
let hardAccelsLayer;
let speedingLayer;
let autozoomEnabled;
let selectedTripIds = [];

L.mapbox.accessToken = 'pk.eyJ1IjoiYXV0b21hdGljIiwiYSI6IlVGb0RHOTgifQ.uMNDoXZe6UI7NVUkDHJgSQ';

function scaleMarkers() {
  const zoom = map.getZoom();
  const normalIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'normal');
  const hardBrakeIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'hardBrake');
  const hardAccelIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'hardAccel');
  const weight = mapHelpers.getPathWidthbyZoom(zoom);

  const highlightedTripIds = _.pluck(highlight.getHighlightedTrips(), 'id');

  markersLayer.eachLayer((marker) => {
    if (!_.contains(selectedTripIds, marker.options.id) && !_.contains(highlightedTripIds, marker.options.id)) {
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

exports.updateMap = function updateMap(trips) {
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
    if (_.contains(selectedTripIds, trip.id)) {
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
        select.toggleSelect(trip);
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
  autozoomEnabled = value;
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

exports.highlightTrips = function highlightTrips(trips, zoomTrip) {
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

  if (autozoomEnabled && zoomTrip) {
    _.defer(() => {
      zoomTrips(trips);
    });
  }
};

exports.unhighlightTrips = function unhighlightTrips(trips, zoomTrip) {
  const zoom = map.getZoom();
  let pathStyle;
  let aIcon;
  let bIcon;

  trips.forEach(trip => {
    const path = pathsLayer.getLayer(trip.pathID);
    const startMarker = markersLayer.getLayer(trip.startMarkerID);
    const endMarker = markersLayer.getLayer(trip.endMarkerID);

    if (_.contains(selectedTripIds, trip.id)) {
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

  if (speedingLayer.getLayers().length) {
    speedingLayer.bringToFront();
  }

  if (autozoomEnabled && zoomTrip) {
    fitBounds();
  }
};

exports.selectTrips = function selectTrips(trips) {
  selectedTripIds = _.union(selectedTripIds, _.pluck(trips, 'id'));

  const zoom = map.getZoom();
  const pathStyle = mapHelpers.styleLine(zoom, 'selected');
  const aIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'aSelectedIcon');
  const bIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'bSelectedIcon');

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

  if (autozoomEnabled) {
    zoomTrips(trips);
  }
};

exports.deselectTrips = function deselectTrips(trips) {
  selectedTripIds = _.difference(selectedTripIds, _.pluck(trips, 'id'));

  const zoom = map.getZoom();
  const pathStyle = mapHelpers.styleLine(zoom);
  const aIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'normal');
  const bIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'normal');

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

  if (autozoomEnabled) {
    fitBounds();
  }
};
