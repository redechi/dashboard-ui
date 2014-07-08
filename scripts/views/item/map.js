define([
  'backbone',
  'mapbox',
  'markercluster',
  '../../communicator',
  'hbs!tmpl/item/map_tmpl',
  '../../controllers/unit_formatters',
  '../../controllers/map_helpers'
],
function( Backbone, mapbox, markercluster, coms, MapTmpl, formatters, mapHelpers) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a Map ItemView");
      coms.on('trips:highlight', _.bind(this.highlightMap, this));
      coms.on('trips:unhighlight', _.bind(this.unhighlightMap, this));
      coms.on('trips:zoom', _.bind(this.zoomMap, this));
      coms.on('trips:unzoom', _.bind(this.unzoomMap, this));
      coms.on('filter', _.bind(this.resetCollection, this));
    },

    collection: new Backbone.Collection([]),

    resetCollection: function (newCollection) {
      this.collection.reset(newCollection.toArray());
    },

    collectionEvents: {
      'reset': 'updateMap',
      'sync': 'updateMap'
    },

    template: MapTmpl,

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {
      'click .mapLocationFilter': 'updateLocationFilter'
    },

    updateLocationFilter: function (e) {
      $(e.target).data('latlng');
      coms.trigger('filters:updateLocationFilter', e);
    },

    /* on render callback */
    onRender: function () {
      this.createMap();
      this.updateMap();
    },


    createMap: function() {
      var mapbox = this.mapbox = L.mapbox.map(this.$el.find('.map').get(0), 'automatic.i86oppa4'),
          pathsLayer = this.pathsLayer = L.mapbox.featureLayer(),
          markersLayer = this.markersLayer = new L.MarkerClusterGroup(),
          markers = this.markers = [];

      mapHelpers.enablePolyline();

      mapbox.addLayer(markersLayer);
    },



    highlightMap: function (model) {
      var id = model.get('id'),
          markersLayer = this.markersLayer;

      this.pathsLayer.eachLayer(function(layer) {
        if(layer.options.id == id) {
          layer.eachLayer(function(layer) {
            if(layer instanceof L.Polyline) {
              layer.setStyle({opacity: 1, color: '#68e68d'});
            }
          });
        } else {
          layer.eachLayer(function(layer) {
            if(layer instanceof L.Polyline) {
              layer.setStyle({opacity: 0.2});
            }
          });
        }
      });

      this.markersLayer.eachLayer(function(marker) {
        if(marker.options.id !== id) {
          markersLayer.removeLayer(marker);
        }
      });
    },


    unhighlightMap: function (model) {
      var mapbox = this.mapbox,
          markersLayer = this.markersLayer;

      this.pathsLayer.eachLayer(function(layer) {
        layer.eachLayer(function(layer) {
          if(layer instanceof L.Polyline) {
            layer.setStyle({opacity: 1, color: '#08b1d5'});
          }
        });
      });

      try {
        //sometimes this is triggered along with a filter, so layers are gone
        markersLayer.clearLayers();
      } catch(e) { }
      this.markers.forEach(function(marker) {
        markersLayer.addLayer(marker);
      });
    },


    zoomMap: function (model) {
      var id = model.get('id'),
          bounds;

      this.pathsLayer.eachLayer(function(layer) {
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
    },


    unzoomMap: function (model) {
      this.fitBoundsMap(this.pathsLayer.getBounds());
    },


    fitBoundsMap: function(bounds) {
      if(bounds && bounds.isValid()) {
        this.mapbox.fitBounds(bounds, {padding: [50, 50]});
      }
    },


    clearMap: function() {
      this.pathsLayer.clearLayers();
      this.markersLayer.clearLayers();
      this.markers = [];
    },


    updateMap: function () {
      this.clearMap();

      var mapbox = this.mapbox,
          pathsLayer = this.pathsLayer,
          markersLayer = this.markersLayer,
          markers = this.markers,
          self = this;

      _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g
      };

      var popupTemplate = _.template('{{name}}<br>{{time}}<br>' +
        '<a href="#" data-lat="{{lat}}" data-lon="{{lon}}" data-name="{{name}}" data-type="end" class="mapLocationFilter">Trips to here</a><br>' +
        '<a href="#" data-lat="{{lat}}" data-lon="{{lon}}" data-name="{{name}}" data-type="start" class="mapLocationFilter">Trips from here</a>');

      function attachEvents(feature, layer) {
        layer
          .on('mouseover', function (e) {
            // get model from id
            var newModel = self.collection.where({id: e.target.feature.properties.id }).pop();
            coms.trigger('trips:highlight', newModel);
          })
          .on('mouseout', function () {
            coms.trigger('trips:unhighlight');
          });
        return layer;
      }


      this.collection.each(function (model) {
        var id = model.get('id'),
            startLoc = model.get('start_location'),
            endLoc = model.get('end_location'),
            path = model.get('path'),
            geoJson = L.geoJson([], { style: mapHelpers.styleLine, onEachFeature: attachEvents, id: id});

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
          var startMarker = mapHelpers.createMarker('start', model, popupTemplate);
          startMarker.on('click', function (e) {
            var newModel = self.collection.where({id: e.target.options.id }).pop();
            coms.trigger('trips:highlight', newModel);
          })
          .on('popupclose', function () {
            coms.trigger('trips:unhighlight');
          });

          markers.push(startMarker);
          markersLayer.addLayer(startMarker);
        }

        if (endLoc) {
          var endMarker = mapHelpers.createMarker('end', model, popupTemplate);
          endMarker.on('click', function (e) {
            var newModel = self.collection.where({id: e.target.options.id }).pop();
            coms.trigger('trips:highlight', newModel);
          })
          .on('popupclose', function () {
            coms.trigger('trips:unhighlight');
          });

          markers.push(endMarker);
          markersLayer.addLayer(endMarker);
        }

        geoJson.addTo(pathsLayer);

      });

      mapbox.addLayer(pathsLayer);

      // weird timeout hack for mapbox
      setTimeout(function () {
        var bounds = pathsLayer.getBounds();
        mapbox.invalidateSize();
        if(bounds.isValid()) {
          mapbox.fitBounds(bounds, {padding: [50, 50]});
        }
      }, 0);
    }

  });

});
