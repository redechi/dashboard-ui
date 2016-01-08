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

exports.createMap = function() {
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

exports.updateMap = function(trips, toggleSelect) {
  if(!trips) {
    return;
  }

  let zoom = map.getZoom();
  let pathStyle;
  let aIcon;
  let bIcon;
  let speedingLine = mapHelpers.styleLine(zoom, 'speeding');
  let hardBrakeIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'hardBrake');
  let hardAccelIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'hardAccel');

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

    if(trip.path) {
      let line = L.polyline(polyline.decode(trip.path), pathStyle).addTo(pathsLayer);
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
      let startMarker = L.marker(
        [trip.start_location.lat, trip.start_location.lon],
        {
          icon: aIcon,
          type: 'start',
          id: trip.id
        }
      ).addTo(markersLayer);
      trip.startMarkerID = startMarker._leaflet_id;
    }

    if(trip.end_location) {
      let endMarker = L.marker(
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

  if(speedingLayer.getLayers().length) {
    speedingLayer.bringToFront();
  }

  fitBounds();
};

exports.setAutozoom = function(value) {
  autozoom = value;
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

  markersLayer.eachLayer((marker) => {
    if(!marker.options.selected) {
      marker.setIcon(normalIcon);
    }
  });

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

function getBoundsFromTrips(trips) {
  return trips.reduce((memo, trip) => {
    let path = pathsLayer.getLayer(trip.pathID);
    if(path) {
      let pathBounds = path.getBounds();
      if(!memo) {
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

exports.highlightTrips = function(trips) {
  let zoom = map.getZoom();
  let pathStyle = mapHelpers.styleLine(zoom, 'highlight');
  let aIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'aHighlightedIcon');
  let bIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'bHighlightedIcon')

  trips.forEach(trip => {
    let path = pathsLayer.getLayer(trip.pathID);
    let startMarker = markersLayer.getLayer(trip.startMarkerID);
    let endMarker = markersLayer.getLayer(trip.endMarkerID);

    if(path) {
      path
        .bringToFront()
        .setStyle(pathStyle);
    }

    if(startMarker) {
      startMarker.setIcon(aIcon);
    }

    if(endMarker) {
      endMarker.setIcon(bIcon);
    }
  });

  if(speedingLayer.getLayers().length) {
    speedingLayer.bringToFront();
  }

  if(autozoom) {
    zoomTrips(trips);
  }
}

exports.unhighlightTrips = function(trips) {
  let zoom = map.getZoom();
  let pathStyle;
  let aIcon;
  let bIcon;

  trips.forEach(trip => {
    let path = pathsLayer.getLayer(trip.pathID);
    let startMarker = markersLayer.getLayer(trip.startMarkerID);
    let endMarker = markersLayer.getLayer(trip.endMarkerID);

    if (trip.selected) {
      pathStyle = mapHelpers.styleLine(zoom, 'selected');
      aIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'aSelectedIcon');
      bIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'bSelectedIcon');
    } else {
      pathStyle = mapHelpers.styleLine(zoom);
      aIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'normal');
      bIcon = mapHelpers.getMarkerSizeByZoom(zoom, 'normal');
    }

    if(path) {
      path
        .bringToFront()
        .setStyle(pathStyle);
    }

    if(startMarker) {
      startMarker.setIcon(aIcon);
    }

    if(endMarker) {
      endMarker.setIcon(bIcon);
    }
  });

  if(autozoom) {
    fitBounds();
  }
}
