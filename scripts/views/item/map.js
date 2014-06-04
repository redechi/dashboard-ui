define([
  'backbone',
  '../../communicator',
  'hbs!tmpl/item/map_tmpl',
  '../../collections/trips',
  '../../controllers/unit_formatters'
],
function( Backbone, coms, MapTmpl, trips, formatters) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a Map ItemView");
      coms.on('trips:highlight', _.bind(this.highlightMap, this));
      coms.on('trips:unhighlight', _.bind(this.unhighlightMap, this));
      coms.on('trips:zoom', _.bind(this.zoomMap, this));
      coms.on('trips:unzoom', _.bind(this.unzoomMap, this));
      coms.on('filter', _.bind(this.updateMap, this));
    },

    collection: trips,

    collectionEvents: {
      'reset': 'updateMap',
      'sync': 'updateMap'
    },

    template: MapTmpl,

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {
      'change .noMove': 'setNoMoveStatus'
    },

    /* on render callback */
    onRender: function () {
      this.noMove = false;
      this.createMap();
      this.updateMap();
    },


    highlightMap: function (model) {
      var id = model.get('id');

      this.featureLayer.eachLayer(function(layer) {
        if(layer.options.id == id) {
          layer.eachLayer(function(layer) {
            if(layer instanceof L.Marker) {
              layer.setOpacity(1);
            } else if(layer instanceof L.Polyline) {
              layer.setStyle({opacity: 1, color: '#68e68d'});
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
    },


    unhighlightMap: function (model) {
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
    },


    zoomMap: function (model) {
      var id = model.get('id'),
          noMove = this.noMove,
          bounds;

      if(!noMove) {
        this.featureLayer.eachLayer(function(layer) {
          if(layer.options.id == id) {
            layer.eachLayer(function(layer) {
              if(layer instanceof L.Polyline) {
                if(!bounds) {
                  bounds = L.latLngBounds(layer.getBounds());
                } else {
                  bounds.extend(layer.getBounds());
                }
              }
            });
          }
        });

        this.fitBoundsMap(bounds);
      }
    },


    unzoomMap: function (model) {
      var noMove = this.noMove;
      if(!noMove) {
        this.fitBoundsMap(this.featureLayer.getBounds());
      }
    },


    fitBoundsMap: function(bounds) {
      if(bounds && bounds.isValid()) {
        this.mapbox.fitBounds(bounds, {padding: [50, 50]});
      }
    },


    setNoMoveStatus: function() {
      this.noMove = $('.noMove').is(':checked');
    },


    createMap: function() {
      var mapbox = this.mapbox = L.mapbox.map(this.$el.find('.map').get(0), 'automatic.i86oppa4'),
          featureLayer = this.featureLayer = L.mapbox.featureLayer();
    },


    updateMap: function () {
      var mapbox = this.mapbox,
          featureLayer = this.featureLayer,
          markers = new L.MarkerClusterGroup();

      _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g
      };

      var popupTemplate = _.template('{{name}}<br>{{time}}<br>' +
        '<a href="#" data-lat="{{lat}}" data-lon="{{lon}}" data-name="{{name}}" data-type="end" class="mapLocationFilter">Trips to here</a><br>' +
        '<a href="#" data-lat="{{lat}}" data-lon="{{lon}}" data-name="{{name}}" data-type="start" class="mapLocationFilter">Trips from here</a>');

      featureLayer.clearLayers();

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


      function createMarker(type, model) {
        var id = model.get('id'),
            location,
            time,
            icon;

        if(type == 'start') {
          location = model.get('start_location'),
          time = formatters.formatTime(model.get('start_time'), model.get('start_time_zone'), 'MMM D, YYYY h:mm A'),
          icon = aIcon
        } else {
          location = model.get('end_location'),
          time = formatters.formatTime(model.get('end_time'), model.get('end_time_zone'), 'MMM D, YYYY h:mm A'),
          icon = bIcon
        }

        var popupText = popupTemplate({
          name: location.name,
          time: time,
          lat: location.lat,
          lon: location.lon
        });

        var marker = L.marker([location.lat, location.lon], {icon: icon, type: type, id: id})
          .bindPopup(popupText)
          .on('mouseover', function (e) {
            // get model from id
            var newModel = trips.where({id: e.target.options.id }).pop();
            coms.trigger('trips:highlight', newModel);
          })
          .on('mouseout', function () {
            coms.trigger('trips:unhighlight');
          });

        return marker;
      }


      function styleLine(feature) {
        return {
          color: '#08b1d5',
          opacity: 0.8,
          weight: 3
        };
      }


      function attachEvents(feature, layer) {
        layer
          .on('mouseover', function (e) {
            // get model from id
            var newModel = trips.where({id: e.target.feature.properties.id }).pop();
            coms.trigger('trips:highlight', newModel);
          })
          .on('mouseout', function () {
            coms.trigger('trips:unhighlight');
          });
        return layer;
      }


      this.collection.each(_.bind(function (model) {
        var id = model.get('id'),
            startLoc = model.get('start_location'),
            endLoc = model.get('end_location'),
            path = model.get('path'),
            geoJson = L.geoJson([], { style: styleLine, onEachFeature: attachEvents, id: id});

        if (path) {
          geoJson.addData({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: L.GeoJSON.decodeLine(path)
            },
            properties: {
              id: id
            }
          });
        }

        if (startLoc) {
          markers.addLayer(createMarker('start', model));
        }

        if (endLoc) {
          markers.addLayer(createMarker('end', model));
        }

        geoJson.addTo(featureLayer);
        
      }), this);

      markers.addTo(featureLayer);
      mapbox.addLayer(featureLayer);

      // weird timeout hack for mapbox
      setTimeout(function () {
        var bounds = featureLayer.getBounds();
        mapbox.invalidateSize();
        if(bounds.isValid()) {
          mapbox.fitBounds(bounds, {padding: [50, 50]});
        }
      }, 0);
    }

  });

});
