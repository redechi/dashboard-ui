import L from 'mapbox.js';
import _ from 'underscore';
import polyline from 'polyline';

const formatters = require('./formatters');
const stats = require('./stats');

let map;
let mapType;
let pathsLayer = L.mapbox.featureLayer();
let markersLayer = L.mapbox.featureLayer();
let hardBrakesLayer = L.mapbox.featureLayer();
let hardAccelsLayer = L.mapbox.featureLayer();
let speedingLayer = L.mapbox.featureLayer();

const icons = {
  mainIconSmall: L.icon({
    iconUrl: '/_assets/images/map_pin.png',
    iconRetinaUrl: '/_assets/images/map_pin@2x.png',
    iconSize: [8, 8],
    iconAnchor: [6, 6],
    popupAnchor: [0,-28]
  }),

  mainIconMedium: L.icon({
    iconUrl: '/_assets/images/map_pin.png',
    iconRetinaUrl: '/_assets/images/map_pin@2x.png',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0,-28]
  }),

  mainIconLarge: L.icon({
    iconUrl: '/_assets/images/map_pin.png',
    iconRetinaUrl: '/_assets/images/map_pin@2x.png',
    iconSize: [18, 18],
    iconAnchor: [6, 6],
    popupAnchor: [0,-28]
  }),

  aIcon: L.icon({
    iconUrl: '/_assets/images/map_pin_a.png',
    iconRetinaUrl: '/_assets/images/map_pin_a@2x.png',
    iconSize: [17, 28],
    iconAnchor: [8, 28],
    popupAnchor: [0,-28]
  }),

  bIcon: L.icon({
    iconUrl: '/_assets/images/map_pin_b.png',
    iconRetinaUrl: '/_assets/images/map_pin_b@2x.png',
    iconSize: [17, 28],
    iconAnchor: [8, 28],
    popupAnchor: [0,-28]
  }),

  aSelectedIcon: L.icon({
    iconUrl: '/_assets/images/map_pin_a_selected.png',
    iconRetinaUrl: '/_assets/images/map_pin_a_selected@2x.png',
    iconSize: [17, 28],
    iconAnchor: [8, 28],
    popupAnchor: [0,-28]
  }),

  bSelectedIcon: L.icon({
    iconUrl: '/_assets/images/map_pin_b_selected.png',
    iconRetinaUrl: '/_assets/images/map_pin_b_selected@2x.png',
    iconSize: [17, 28],
    iconAnchor: [8, 28],
    popupAnchor: [0,-28]
  }),

  aLargeIcon: L.icon({
    iconUrl: '/_assets/images/tripview_map_a.png',
    iconRetinaUrl: '/_assets/images/tripview_map_a@2x.png',
    iconSize: [30, 43],
    iconAnchor: [15, 43],
    popupAnchor: [0,-43]
  }),

  bLargeIcon: L.icon({
    iconUrl: '/_assets/images/tripview_map_b.png',
    iconRetinaUrl: '/_assets/images/tripview_map_b@2x.png',
    iconSize: [30, 43],
    iconAnchor: [15, 43],
    popupAnchor: [0,-43]
  }),

  hardBrakeIconSmall: L.divIcon({
    className: 'hard-brake-icon',
    iconSize: [6, 6]
  }),

  hardBrakeIconMedium: L.divIcon({
    className: 'hard-brake-icon',
    iconSize: [10, 10]
  }),

  hardBrakeIconLarge: L.divIcon({
    className: 'hard-brake-icon',
    iconSize: [16, 16]
  }),

  hardAccelIconSmall: L.divIcon({
    className: 'hard-accel-icon',
    iconSize: [6, 6]
  }),

  hardAccelIconMedium: L.divIcon({
    className: 'hard-accel-icon',
    iconSize: [10, 10]
  }),

  hardAccelIconLarge: L.divIcon({
    className: 'hard-accel-icon',
    iconSize: [16, 16]
  })
};

const lineStyles = {
  styleLine: (zoom) => ({
    color: '#737c81',
    opacity: 0.4,
    weight: getPathWidthbyZoom(zoom)
  }),

  highlightLine: (zoom) => ({
    opacity: 1,
    color: '#5DBEF5',
    weight: Math.max(4, getPathWidthbyZoom(zoom))
  }),

  selectedLine: (zoom) => ({
    opacity: 1,
    color: '#297FB8',
    weight: Math.max(4, getPathWidthbyZoom(zoom))
  }),

  speedingLine: (zoom) => ({
    opacity: 1,
    color: '#F5A623',
    weight: Math.max(4, getPathWidthbyZoom(zoom))
  })
}

exports.createMap = function(type) {
  mapType = type;
  L.mapbox.accessToken = 'pk.eyJ1IjoiYXV0b21hdGljIiwiYSI6IlVGb0RHOTgifQ.uMNDoXZe6UI7NVUkDHJgSQ';

  map = L.mapbox.map('overviewMapContainer', 'automatic.idonii25', {
    zoomControl: false,
    attributionControl: false
  });

  map.addControl(L.control.attribution({
    position: 'bottomleft',
    prefix: false
  }));

  map.on('zoomend', scaleMarkers);

  map.addLayer(markersLayer);
  map.addLayer(pathsLayer);
};

exports.updateMap = function(trips) {
  clearMap();
  if(trips) {
    trips.forEach(addTripToMap);

    // If speeding layer is empty, calculate tripEvents layers (expensive)
    if(!speedingLayer.getLayers().length) {
      buildTripEventsLayer(trips);
    }

    fitBounds();
  }
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

  let normalIcon = getMarkerSizeByZoom(zoom, 'normal');
  let hardBrakeIcon = getMarkerSizeByZoom(zoom, 'hardBrake');
  let hardAccelIcon = getMarkerSizeByZoom(zoom, 'hardAccel');
  let weight = getPathWidthbyZoom(zoom);

  markersLayer.eachLayer((marker) => {
    if(!marker.options.selected && mapType !== 'single_trip') {
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

function getMarkerSizeByZoom(zoom, type) {
  if(type === 'normal') {
    if(zoom >= 15) {
      return icons.mainIconLarge;
    } else if(zoom >= 12) {
      return icons.mainIconMedium;
    } else {
      return icons.mainIconSmall;
    }
  } else if(type === 'hardBrake') {
    if(zoom >= 15) {
      return icons.hardBrakeIconLarge;
    } else if(zoom >= 12) {
      return icons.hardBrakeIconMedium;
    } else {
      return icons.hardBrakeIconSmall;
    }
  } else if(type === 'hardAccel') {
    if(zoom >= 15) {
      return icons.hardAccelIconLarge;
    } else if(zoom >= 12) {
      return icons.hardAccelIconMedium;
    } else {
      return icons.hardAccelIconSmall;
    }
  }
}

function getPathWidthbyZoom(zoom) {
  if(zoom <= 8) {
    return 2;
  } else if(zoom === 9 || zoom === 10) {
    return 3;
  } else if(zoom === 11 || zoom === 12 || zoom === 13) {
    return 4;
  } else if(zoom === 14) {
    return 6;
  } else if(zoom === 15) {
    return 10;
  } else if(zoom === 16) {
    return 12;
  } else {
    return 12;
  }
}

function addTripToMap(trip) {
  let zoom = map.getZoom();
  let pathStyle;
  let aIcon;
  let bIcon;
  if(mapType === 'single_trip') {
    pathStyle = lineStyles.highlightLine(zoom);
    aIcon = icons.aLargeIcon;
    bIcon = icons.bLargeIcon;
  } else {
    pathStyle = lineStyles.styleLine(zoom);
    aIcon = icons.mainIconSmall;
    bIcon = icons.mainIconSmall;
  }

  if(trip.path) {
    let line = L.polyline(polyline.decode(trip.path), pathStyle).addTo(pathsLayer);
    trip.pathID = line._leaflet_id;
  }

  if(trip.start_location) {
    let options = {
      icon: aIcon,
      type: 'start',
      id: trip.id
    };
    let startMarker = L.marker(
      [trip.start_location.lat, trip.start_location.lon],
      options
    ).addTo(markersLayer);
  }

  if(trip.end_location) {
    let options = {
      icon: bIcon,
      type: 'end',
      id: trip.id
    };
    let endMarker = L.marker([trip.end_location.lat, trip.end_location.lon], options).addTo(markersLayer);
  }
}

function clearMap() {
  pathsLayer.clearLayers();
  markersLayer.clearLayers();
}

function buildTripEventsLayer(trips) {
  let zoom = map.getZoom();
  let speedingLine = lineStyles.speedingLine(zoom);
  let hardBrakeIcon = getMarkerSizeByZoom(zoom, 'hardBrake');
  let hardAccelIcon = getMarkerSizeByZoom(zoom, 'hardAccel');

  trips.forEach((trip) => {
    if(trip.path) {
      let decodedPath = polyline.decode(trip.path);

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
          let start = formatters.metersToMiles(item.start_distance_m);
          let end = formatters.metersToMiles(item.end_distance_m);
          let speedingPath = subPath(start, end, decodedPath);
          let lineOptions = _.extend({id: trip.id}, speedingLine);
          speedingLayer.addLayer(L.polyline(speedingPath, lineOptions));
        }
      });
    }
  });
}

function getCumulativeDistance(decodedPath) {
  let cumulativeDistance = 0;

  return decodedPath.map((point1, idx) => {
    if(idx > 0) {
      let point2 = decodedPath[idx - 1];
      let distance = stats.calculateDistanceMi(point1[0], point1[1], point2[0], point2[1]);
      cumulativeDistance += distance;
    }
    return cumulativeDistance;
  });
}

function subPath(startMi, endMi, decodedPath) {
  let distances = getCumulativeDistance(decodedPath);

  return _.reduce(distances, (memo, distance1, idx) => {
    let distance2 = (idx < distances.length - 1) ? distances[idx + 1] : distance1;
    if(startMi <= distance2 && endMi >= distance1) {
      memo.push(decodedPath[idx]);
    }
    return memo;
  }, []);
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

function zoomTrips() {
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
