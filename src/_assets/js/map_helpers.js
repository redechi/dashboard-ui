import L from 'mapbox.js';
import _ from 'lodash';

const stats = require('./stats');


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

  aHighlightedIcon: L.icon({
    iconUrl: '/_assets/images/map_pin_a.png',
    iconRetinaUrl: '/_assets/images/map_pin_a@2x.png',
    iconSize: [17, 28],
    iconAnchor: [8, 28],
    popupAnchor: [0,-28]
  }),

  bHighlightedIcon: L.icon({
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

exports.createMap = function(container) {
  let map = L.mapbox.map(container, 'automatic.idonii25', {
    zoomControl: false,
    attributionControl: false
  });

  map.addControl(L.control.attribution({
    position: 'bottomleft',
    prefix: false
  }));

  return map;
};

exports.getPathWidthbyZoom = function(zoom) {
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
};

exports.getMarkerSizeByZoom = function(zoom, type) {
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
  } else if(type === 'aSelectedIcon') {
    return icons.aSelectedIcon;
  } else if(type === 'bSelectedIcon') {
    return icons.bSelectedIcon;
  } else if(type === 'aHighlightedIcon') {
    return icons.aHighlightedIcon;
  } else if(type === 'bHighlightedIcon') {
    return icons.bHighlightedIcon;
  }
};

exports.styleLine = function(zoom, lineType) {
  if(lineType === 'highlight') {
    return {
      opacity: 1,
      color: '#5DBEF5',
      weight: Math.max(4, exports.getPathWidthbyZoom(zoom))
    };
  } else if(lineType === 'selected') {
    return {
      opacity: 1,
      color: '#297FB8',
      weight: Math.max(4, exports.getPathWidthbyZoom(zoom))
    };
  } else if(lineType === 'speeding') {
    return {
      opacity: 1,
      color: '#F5A623',
      weight: Math.max(4, exports.getPathWidthbyZoom(zoom))
    };
  } else {
    return {
      color: '#737c81',
      opacity: 0.4,
      weight: exports.getPathWidthbyZoom(zoom)
    };
  }
};

exports.getCumulativeDistance = function(decodedPath) {
  let cumulativeDistance = 0;

  return decodedPath.map((point1, idx) => {
    if(idx > 0) {
      let point2 = decodedPath[idx - 1];
      let distance = stats.calculateDistanceMi(point1[0], point1[1], point2[0], point2[1]);
      cumulativeDistance += distance;
    }
    return cumulativeDistance;
  });
};

exports.subPath = function(startMi, endMi, decodedPath, cumulativeDistances) {
  return _.reduce(cumulativeDistances, (memo, distance1, idx) => {
    let distance2 = (idx < cumulativeDistances.length - 1) ? cumulativeDistances[idx + 1] : distance1;
    if(startMi <= distance2 && endMi >= distance1) {
      memo.push(decodedPath[idx]);
    }
    return memo;
  }, []);
};
