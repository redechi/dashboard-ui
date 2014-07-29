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


    speedingLine: function() {
      return {
        opacity: 1,
        color: '#F5A623',
        weight: 2
      };
    },


    highlightMarker: function (marker) {
      if(marker.options.type === 'start') {
        marker.setIcon(this.aIcon);
      } else if(marker.options.type === 'end') {
        marker.setIcon(this.bIcon);
      }
    },


    createMarker: function (type, model) {
      var id = model.get('id'),
          location,
          time;

      _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g
      };

      var popupTemplate = _.template('{{name}}<br>{{typeText}} {{time}}');

      if(type === 'start') {
        location = model.get('start_location');
        time = formatters.formatTime(model.get('start_time'), model.get('start_time_zone'), 'MMM D, YYYY h:mm A');
      } else {
        location = model.get('end_location');
        time = formatters.formatTime(model.get('end_time'), model.get('end_time_zone'), 'MMM D, YYYY h:mm A');
      }

      var name = (location.name) ? location.name.replace(', USA', '') : 'Unknown Address';

      var popupText = popupTemplate({
        name: name,
        time: time,
        lat: location.lat,
        lon: location.lon,
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
          memo.push([decodedPath[idx][1], decodedPath[idx][0]]);
        }
        return memo;
      }, []);
    },


    getBoundsFromTrips: function(trips) {
      return trips.reduce(function(memo, trip) {
        var start = [trip.get('start_location').lat, trip.get('start_location').lon],
            end = [trip.get('end_location').lat, trip.get('end_location').lon];
        if(!memo) {
          memo = L.latLngBounds([start, end]);
        } else {
          memo.extend(start);
          memo.extend(end);
        }
        return memo;
      }, null);
    },


    enablePolyline: L.extend(L.GeoJSON, {
      // This function is from Google's polyline utility.
      // Borrowed from: http://facstaff.unca.edu/mcmcclur/GoogleMaps/EncodePolyline/decode.js
      // Changed to return lng/lats instead of lat/lngs
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

          array.push([lng * 1e-5, lat * 1e-5]);
        }
        return array;
      }
    })
  };
});
