define([
  'mapbox',
  './unit_formatters',
  './stats'
],
function( mapbox, formatters, stats ) {
  'use strict';

  return {
    mainIcon: L.icon({
      iconUrl: '/assets/img/map_pin_cluster_2.png',
      iconRetinaUrl: '/assets/img/map_pin_cluster_2@2x.png',
      iconSize: [12, 12],
      iconAnchor: [6, 6],
      popupAnchor: [0,-28]
    }),

    aIcon: L.icon({
      iconUrl: '/assets/img/map_pin_a.png',
      iconRetinaUrl: '/assets/img/map_pin_a@2x.png',
      iconSize: [17, 28],
      iconAnchor: [8, 28],
      popupAnchor: [0,-28]
    }),


    bIcon: L.icon({
      iconUrl: '/assets/img/map_pin_b.png',
      iconRetinaUrl: '/assets/img/map_pin_b@2x.png',
      iconSize: [17, 28],
      iconAnchor: [8, 28],
      popupAnchor: [0,-28]
    }),


    aSelectedIcon: L.icon({
      iconUrl: '/assets/img/map_pin_a_selected.png',
      iconRetinaUrl: '/assets/img/map_pin_a_selected@2x.png',
      iconSize: [17, 28],
      iconAnchor: [8, 28],
      popupAnchor: [0,-28]
    }),


    bSelectedIcon: L.icon({
      iconUrl: '/assets/img/map_pin_b_selected.png',
      iconRetinaUrl: '/assets/img/map_pin_b_selected@2x.png',
      iconSize: [17, 28],
      iconAnchor: [8, 28],
      popupAnchor: [0,-28]
    }),


    aLargeIcon: L.icon({
      iconUrl: '/assets/img/tripview_map_a.png',
      iconRetinaUrl: '/assets/img/tripview_map_a@2x.png',
      iconSize: [30, 43],
      iconAnchor: [15, 43],
      popupAnchor: [0,-43]
    }),


    bLargeIcon: L.icon({
      iconUrl: '/assets/img/tripview_map_b.png',
      iconRetinaUrl: '/assets/img/tripview_map_b@2x.png',
      iconSize: [30, 43],
      iconAnchor: [15, 43],
      popupAnchor: [0,-43]
    }),


    hardBrakeIcon: L.divIcon({
      className: 'hardBrakeIcon',
      iconSize: [12, 12]
    }),


    hardAccelIcon: L.divIcon({
      className: 'hardAccelIcon',
      iconSize: [12, 12]
    }),


    styleLine: function() {
      return {
        color: '#8D989F',
        opacity: 0.4,
        weight: 2
      };
    },


    highlightLine: function() {
      return {
        opacity: 1,
        color: '#5DBEF5',
        weight: 4,
      };
    },


    selectedLine: function() {
      return {
        opacity: 1,
        color: '#297FB8',
        weight: 4,
      };
    },


    speedingLine: function() {
      return {
        opacity: 1,
        color: '#F5A623',
        weight: 2
      };
    },


    highlightSpeedingLine: function() {
      return {
        opacity: 1,
        color: '#F5A623',
        weight: 4
      };
    },


    highlightMarker: function (marker, options) {
      options = options || {};
      if(marker.options.type === 'start') {
        if(options.type === 'large') {
          marker.setIcon(this.aLargeIcon);
        } else {
          marker.setIcon(this.aIcon);
        }
      } else if(marker.options.type === 'end') {
        if(options.type === 'large') {
          marker.setIcon(this.bLargeIcon);
        } else {
          marker.setIcon(this.bIcon);
        }
      }
    },


    selectMarker: function (marker, options) {
      options = options || {};
      if(marker.options.type === 'start') {
        marker.setIcon(this.aSelectedIcon);
      } else if(marker.options.type === 'end') {
        marker.setIcon(this.bSelectedIcon);
      }
    },


    createMarker: function (type, model) {
      var id = model.get('id'),
          location,
          time;

      if(type === 'start') {
        location = model.get('start_location');
        time = formatters.formatTime(model.get('start_time'), model.get('start_time_zone'), 'MMM D, YYYY h:mm A');
      } else {
        location = model.get('end_location');
        time = formatters.formatTime(model.get('end_time'), model.get('end_time_zone'), 'MMM D, YYYY h:mm A');
      }

      var popupText = L.mapbox.template('{{name}}<br>{{typeText}} {{time}}', {
        name: formatters.formatAddress(name),
        time: time,
        typeText: (type === 'start') ? 'Departed at' : 'Arrived at'
      });

      var marker = L.marker([location.lat, location.lon], {icon: this.mainIcon, type: type, id: id}).bindPopup(popupText);

      return marker;
    },


    cumulativeDistance: function(decodedPath) {
      var cumulativeDistance = 0;

      return decodedPath.map(function(latlng1, idx) {
        if(idx > 0) {
          var latlng2 = decodedPath[idx - 1];
          var distance = stats.calculateDistanceMi(latlng1[0], latlng1[1], latlng2[0], latlng2[1]);
          cumulativeDistance += distance;
        }
        return cumulativeDistance;
      });
    },


    subPath: function(startMi, endMi, decodedPath) {
      var distances = this.cumulativeDistance(decodedPath);

      return _.reduce(distances, function(memo, distance1, idx) {
        var distance2 = (idx < distances.length - 1) ? distances[idx + 1] : distance1;
        if(startMi <= distance2 && endMi >= distance1) {
          memo.push(decodedPath[idx]);
        }
        return memo;
      }, []);
    },


    enablePolyline: L.extend(L.GeoJSON, {
      // This function is from Google's polyline utility.
      // Borrowed from: http://facstaff.unca.edu/mcmcclur/GoogleMaps/EncodePolyline/decode.js
      decodeLine: function (encoded) {
        var len = encoded.length;
        var index = 0;
        var array = [];
        var lat = 0;
        var lng = 0;

        while (index < len) {
          var b;
          var shift = 0;
          var result = 0;
          do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
          } while (b >= 0x20);
          var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
          lat += dlat;

          shift = 0;
          result = 0;
          do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
          } while (b >= 0x20);
          var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
          lng += dlng;

          array.push([lat * 1e-5, lng * 1e-5]);
        }
        return array;
      }
    })
  };
});
