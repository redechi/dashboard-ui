import L from 'mapbox.js';
import _ from 'lodash';

const stats = require('./stats');

const icons = {
  mainIconSmall: L.icon({
    iconUrl: '_assets/images/map_pin.png',
    iconRetinaUrl: '_assets/images/map_pin@2x.png',
    iconSize: [8, 8],
    iconAnchor: [6, 6],
    popupAnchor: [0, -28]
  }),

  mainIconMedium: L.icon({
    iconUrl: '_assets/images/map_pin.png',
    iconRetinaUrl: '_assets/images/map_pin@2x.png',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -28]
  }),

  mainIconLarge: L.icon({
    iconUrl: '_assets/images/map_pin.png',
    iconRetinaUrl: '_assets/images/map_pin@2x.png',
    iconSize: [18, 18],
    iconAnchor: [6, 6],
    popupAnchor: [0, -28]
  }),

  aHighlightedIcon: L.icon({
    iconUrl: '_assets/images/map_pin_a.png',
    iconRetinaUrl: '_assets/images/map_pin_a@2x.png',
    iconSize: [17, 28],
    iconAnchor: [8, 28],
    popupAnchor: [0, -28]
  }),

  bHighlightedIcon: L.icon({
    iconUrl: '_assets/images/map_pin_b.png',
    iconRetinaUrl: '_assets/images/map_pin_b@2x.png',
    iconSize: [17, 28],
    iconAnchor: [8, 28],
    popupAnchor: [0, -28]
  }),

  aSelectedIcon: L.icon({
    iconUrl: '_assets/images/map_pin_a_selected.png',
    iconRetinaUrl: '_assets/images/map_pin_a_selected@2x.png',
    iconSize: [17, 28],
    iconAnchor: [8, 28],
    popupAnchor: [0, -28]
  }),

  bSelectedIcon: L.icon({
    iconUrl: '_assets/images/map_pin_b_selected.png',
    iconRetinaUrl: '_assets/images/map_pin_b_selected@2x.png',
    iconSize: [17, 28],
    iconAnchor: [8, 28],
    popupAnchor: [0, -28]
  }),

  aLargeIcon: L.icon({
    iconUrl: '_assets/images/tripview_map_a.png',
    iconRetinaUrl: '_assets/images/tripview_map_a@2x.png',
    iconSize: [30, 43],
    iconAnchor: [15, 43],
    popupAnchor: [0, -43]
  }),

  bLargeIcon: L.icon({
    iconUrl: '_assets/images/tripview_map_b.png',
    iconRetinaUrl: '_assets/images/tripview_map_b@2x.png',
    iconSize: [30, 43],
    iconAnchor: [15, 43],
    popupAnchor: [0, -43]
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

exports.createMap = function createMap(container) {
  const map = L.mapbox.map(container, 'automatic.idonii25', {
    zoomControl: false
  });

  return map;
};

exports.getPathWidthbyZoom = function getPathWidthbyZoom(zoom) {
  let width;
  if (zoom <= 8) {
    width = 2;
  } else if (zoom === 9 || zoom === 10) {
    width = 3;
  } else if (zoom === 11 || zoom === 12 || zoom === 13) {
    width = 4;
  } else if (zoom === 14) {
    width = 6;
  } else if (zoom === 15) {
    width = 10;
  } else if (zoom === 16) {
    width = 12;
  } else {
    width = 12;
  }

  return width;
};

exports.getMarkerSizeByZoom = function getMarkerSizeByZoom(zoom, type) {
  let icon;
  if (type === 'normal') {
    if (zoom >= 15) {
      icon = icons.mainIconLarge;
    } else if (zoom >= 12) {
      icon = icons.mainIconMedium;
    } else {
      icon = icons.mainIconSmall;
    }
  } else if (type === 'hardBrake') {
    if (zoom >= 15) {
      icon = icons.hardBrakeIconLarge;
    } else if (zoom >= 12) {
      icon = icons.hardBrakeIconMedium;
    } else {
      icon = icons.hardBrakeIconSmall;
    }
  } else if (type === 'hardAccel') {
    if (zoom >= 15) {
      icon = icons.hardAccelIconLarge;
    } else if (zoom >= 12) {
      icon = icons.hardAccelIconMedium;
    } else {
      icon = icons.hardAccelIconSmall;
    }
  } else if (type === 'aSelectedIcon') {
    icon = icons.aSelectedIcon;
  } else if (type === 'bSelectedIcon') {
    icon = icons.bSelectedIcon;
  } else if (type === 'aHighlightedIcon') {
    icon = icons.aHighlightedIcon;
  } else if (type === 'bHighlightedIcon') {
    icon = icons.bHighlightedIcon;
  }

  return icon;
};

exports.styleLine = function styleLine(zoom, lineType) {
  let style;
  if (lineType === 'highlight') {
    style = {
      opacity: 1,
      color: '#5DBEF5',
      weight: Math.max(4, exports.getPathWidthbyZoom(zoom))
    };
  } else if (lineType === 'selected') {
    style = {
      opacity: 1,
      color: '#297FB8',
      weight: Math.max(4, exports.getPathWidthbyZoom(zoom))
    };
  } else if (lineType === 'speeding') {
    style = {
      opacity: 1,
      color: '#F5A623',
      weight: Math.max(4, exports.getPathWidthbyZoom(zoom))
    };
  } else {
    style = {
      color: '#737c81',
      opacity: 0.4,
      weight: exports.getPathWidthbyZoom(zoom)
    };
  }

  return style;
};

exports.getCumulativeDistance = function getCumulativeDistance(decodedPath) {
  let cumulativeDistance = 0;

  return decodedPath.map((point1, idx) => {
    if (idx > 0) {
      const point2 = decodedPath[idx - 1];
      const distance = stats.calculateDistanceMi(point1[0], point1[1], point2[0], point2[1]);
      cumulativeDistance += distance;
    }

    return cumulativeDistance;
  });
};

exports.subPath = function subPath(startMi, endMi, decodedPath, cumulativeDistances) {
  return _.reduce(cumulativeDistances, (memo, distance1, idx) => {
    const distance2 = (idx < cumulativeDistances.length - 1) ? cumulativeDistances[idx + 1] : distance1;
    if (startMi <= distance2 && endMi >= distance1) {
      memo.push(decodedPath[idx]);
    }

    return memo;
  }, []);
};
