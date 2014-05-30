define([
  'backbone',
  '../../communicator',
  'hbs!tmpl/item/map_tmpl',
  '../../collections/trips'
],
function( Backbone, coms, MapTmpl, trips, P/* not used */) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a Map ItemView");
      coms.on('focus', _.bind(this.focusMap, this));
      coms.on('removeFocus', _.bind(this.removeFocusMap, this));
      this.collection.on('filter', _.bind(this.updateMap, this));
    },

    collection: trips,

    template: MapTmpl,

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {},

    /* on render callback */
    onRender: function () {
      if (this.collection.length && !this.mapbox) {
        this.updateMap();
      } else {
        this.collection.once('sync', _.bind(this.updateMap, this));
      }
    },

    focusMap: function (model) {
      var id = model.get('id'),
          bounds;

      this.featureLayer.eachLayer(function(layer) {
        if(layer.options.id == id) {
          layer.eachLayer(function(layer) {
            if(layer instanceof L.Marker) {
              layer.setOpacity(1);
            } else if(layer instanceof L.Polyline) {
              layer.setStyle({opacity: 1, color: '#68e68d'});
              if(!bounds) {
                bounds = L.latLngBounds(layer.getBounds());
              } else {
                bounds.extend(layer.getBounds());
              }
            }
          });
        } else {
          layer.eachLayer(function(layer) {
            if(layer instanceof L.Marker) {
              layer.setOpacity(0.2);
            } else if(layer instanceof L.Polyline) {
              layer.setStyle({opacity: 0.2});
            }
          });
        }
      });

      this.fitBoundsMap(bounds);
    },

    removeFocusMap: function (model) {
      var mapbox = this.mapbox,
          featureLayer = this.featureLayer;

      featureLayer.eachLayer(function(layer) {
        layer.eachLayer(function(layer) {
          if(layer instanceof L.Marker) {
            layer.setOpacity(0.8);
          } else if(layer instanceof L.Polyline) {
            layer.setStyle({opacity: 1, color: '#08b1d5'});
          }
        });
      });

      this.fitBoundsMap(featureLayer.getBounds());
    },

    fitBoundsMap: function(bounds) {
      this.mapbox.fitBounds(bounds, {padding: [50, 50]});
    },

    updateMap: function () {
      var mapbox = this.mapbox = L.mapbox.map(this.el, 'automatic.i86oppa4'),
          featureLayer = this.featureLayer = L.mapbox.featureLayer();

      L.extend(L.GeoJSON, {
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
      });

      var aIcon = L.icon({
        iconUrl: '/assets/img/a.png',
        iconSize: [25, 41],
        iconAnchor: [12, 40],
        popupAnchor: [0,-41],
        shadowUrl: 'https://api.tiles.mapbox.com/mapbox.js/v1.6.1/images/marker-shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [12, 40]
      });

      var bIcon = L.icon({
        iconUrl: '/assets/img/b.png',
        iconSize: [25, 41],
        iconAnchor: [12, 40],
        popupAnchor: [0,-41],
        shadowUrl: 'https://api.tiles.mapbox.com/mapbox.js/v1.6.1/images/marker-shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [12, 40]
      });


      function createMarker(feature, latlng) {
        var icon = (feature.properties.type == 'start') ? aIcon : bIcon;
        return L.marker(latlng, {icon: icon});
      }


      function styleLine(feature) {
        return {
          color: '#08b1d5',
          opacity: 0.8,
          weight: 3
        };
      }


      function attachEvents(feature, layer) {
        layer.on('mouseover', function (e) {
          // get model from id
          var newModel = trips.where({id: e.options.id }).pop();
          coms.trigger('map:focus', newModel);
        });
        return layer;
      }


      this.collection.each(_.bind(function (model) {
        var id = model.get('id'),
            startLoc = model.get('start_location'),
            endLoc = model.get('end_location'),
            path = model.get('path'),
            geoJson = L.geoJson([], { pointToLayer: createMarker, style: styleLine, onEachFeature: attachEvents, id: id});

        if (path) {
          geoJson.addData({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: L.GeoJSON.decodeLine(path)
            }
          });
        }

        geoJson.addData({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [startLoc.lon, startLoc.lat],
          },
          properties:{
            title: 'Start',
            type: 'start',
            id: id
          },
        });

        geoJson.addData({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [endLoc.lon, endLoc.lat]
          },
          properties:{
            title: 'End',
            type: 'end',
            id: id
          },
        });

        geoJson.addTo(featureLayer);
      }), this);

      mapbox.addLayer(featureLayer);

      // weird timeout hack for mapbox
      setTimeout(function () {
        mapbox.invalidateSize();
        mapbox.fitBounds(featureLayer.getBounds(), {padding: [50, 50]});
      }, 0);
    }

  });

});
