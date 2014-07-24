define([
  'mapbox',
  './unit_formatters'
],
function( mapbox, formatters ) {
  'use strict';

  return {
    mainIcon: L.icon({
      iconUrl: '/assets/img/map_pin_cluster_2.png',
      iconRetinaUrl: '/assets/img/map_pin_cluster_2@2x.png',
      iconSize: [12, 12],
      iconAnchor: [6, 6],
      popupAnchor: [0,-12]
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


    highlightMarker: function (marker) {
      if(marker.options.type === 'start') {
        marker.setIcon(this.aIcon);
      } else if(marker.options.type === 'end') {
        marker.setIcon(this.bIcon);
      }
    },


    createMarker: function (type, model, popupTemplate) {
      var id = model.get('id'),
          location,
          time,
          icon;

      if(type === 'start') {
        location = model.get('start_location');
        time = formatters.formatTime(model.get('start_time'), model.get('start_time_zone'), 'MMM D, YYYY h:mm A');
        icon = this.mainIcon;
      } else {
        location = model.get('end_location');
        time = formatters.formatTime(model.get('end_time'), model.get('end_time_zone'), 'MMM D, YYYY h:mm A');
        icon = this.mainIcon;
      }

      var popupText = popupTemplate({
        name: location.name,
        time: time,
        lat: location.lat,
        lon: location.lon
      });

      var marker = L.marker([location.lat, location.lon], {icon: icon, type: type, id: id}).bindPopup(popupText);

      return marker;
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
