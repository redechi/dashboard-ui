define([
  'mapbox',
  './unit_formatters'
],
function( mapbox, formatters ) {
  'use strict';

  return {
    aIcon: L.icon({
      iconUrl: '/assets/img/a.png',
      iconSize: [25, 41],
      iconAnchor: [12, 40],
      popupAnchor: [0,-41],
      shadowUrl: '//api.tiles.mapbox.com/mapbox.js/v1.6.1/images/marker-shadow.png',
      shadowSize: [41, 41],
      shadowAnchor: [12, 40]
    }),
    bIcon: L.icon({
      iconUrl: '/assets/img/b.png',
      iconSize: [25, 41],
      iconAnchor: [12, 40],
      popupAnchor: [0,-41],
      shadowUrl: '//api.tiles.mapbox.com/mapbox.js/v1.6.1/images/marker-shadow.png',
      shadowSize: [41, 41],
      shadowAnchor: [12, 40]
    }),
    hardBrakeIcon: L.divIcon({
      className: 'hardBrakeIcon',
      iconSize: [12, 12]
    }),
    hardAccelIcon: L.divIcon({
      className: 'hardAccelIcon',
      iconSize: [12, 12]
    }),
    styleLine: function(feature) {
      return {
        color: '#08b1d5',
        opacity: 0.8,
        weight: 3
      };
    },
    createMarker: function (type, model, popupTemplate) {
      var id = model.get('id'),
          location,
          time,
          icon;

      if(type == 'start') {
        location = model.get('start_location');
        time = formatters.formatTime(model.get('start_time'), model.get('start_time_zone'), 'MMM D, YYYY h:mm A');
        icon = this.aIcon;
      } else {
        location = model.get('end_location');
        time = formatters.formatTime(model.get('end_time'), model.get('end_time_zone'), 'MMM D, YYYY h:mm A');
        icon = this.bIcon;
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
