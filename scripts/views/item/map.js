define([
  'backbone',
  'mapbox',
  '../../communicator',
  'hbs!tmpl/item/map_tmpl',
  '../../controllers/unit_formatters',
  '../../controllers/map_helpers'
],
function( Backbone, mapbox, coms, MapTmpl, formatters, mapHelpers ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a Map ItemView");
      coms.on('trips:highlight', _.bind(this.highlightMap, this));
      coms.on('trips:unhighlight', _.bind(this.unhighlightMap, this));
      coms.on('filter', _.bind(this.resetCollection, this));
    },

    collection: new Backbone.Collection([]),

    resetCollection: function (collection) {
      this.collection.reset(collection);
    },

    collectionEvents: {
      'reset': 'updateMap',
      'sync': 'updateMap'
    },

    template: MapTmpl,

    events: {
      'click .zoomIn': 'zoomIn',
      'click .zoomOut': 'zoomOut'
    },


    mapDiv: function() {
      return this.$el.find('.map').get(0);
    },


    createMap: function() {
      this.mapbox = L.mapbox.map(this.mapDiv(), 'automatic.i86oppa4', { zoomControl: false });
      this.pathsLayer = L.mapbox.featureLayer();
      this.markersLayer = new L.featureGroup();
      this.markers = [];

      mapHelpers.enablePolyline();

      this.mapbox.addLayer(this.markersLayer);
    },


    highlightMap: function (model) {
      var id = model.get('id');

      this.pathsLayer.eachLayer(function(layer) {
        if(layer.options.id == id) {
          layer.eachLayer(function(layer) {
            if(layer instanceof L.Polyline) {
              layer.setStyle(mapHelpers.highlightLine());
            }
          });
        } else {
          layer.eachLayer(function(layer) {
            if(layer instanceof L.Polyline) {
              layer.setStyle(mapHelpers.styleLine());
            }
          });
        }
      });

      this.markersLayer.eachLayer(function(marker) {
        if(marker.options.id === id) {
          mapHelpers.highlightMarker(marker);
        } else {
          marker.setIcon(mapHelpers.mainIcon);
        }
      });
    },


    unhighlightMap: function (model) {
      this.pathsLayer.eachLayer(function(layer) {
        layer.eachLayer(function(layer) {
          if(layer instanceof L.Polyline) {
            layer.setStyle(mapHelpers.styleLine());
          }
        });
      });

      this.markersLayer.eachLayer(function(marker) {
        marker.setIcon(mapHelpers.mainIcon);
      });
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


    attachEvents: function (feature, layer) {
      var self = this;
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
    },


    updateMap: function () {
      if(!this.mapDiv()) {
        return;
      } else if(!this.mapbox) {
        this.createMap();
      } else {
        this.clearMap();
      }

      _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g
      };

      var self = this,
          mapbox = this.mapbox,
          pathsLayer = this.pathsLayer,
          markersLayer = this.markersLayer,
          markers = this.markers,
          popupTemplate = _.template('{{name}}<br>{{time}}');


      this.collection.each(function (model) {
        var id = model.get('id'),
            startLoc = model.get('start_location'),
            endLoc = model.get('end_location'),
            path = model.get('path'),
            geoJson = L.geoJson([], {
              style: mapHelpers.styleLine,
              onEachFeature: _.bind(self.attachEvents, self),
              id: id
            });

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

      this.fitBounds(pathsLayer.getBounds());
    },


    fitBounds: function(bounds) {
      this.mapbox.invalidateSize();
      if(bounds.isValid()) {
        this.mapbox.fitBounds(bounds, {padding: [50, 50]});
      }
    },


    zoomIn: function() {
      this.mapbox.zoomIn();
    },


    zoomOut: function() {
      this.mapbox.zoomOut();
    },


    onShow: function () {
      this.updateMap();
    }

  });

});
