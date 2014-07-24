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
      'click .zoomOut': 'zoomOut',
      'change .showTripEvents': 'toggleTripEvents'
    },


    mapDiv: function() {
      return this.$el.find('.map').get(0);
    },


    createMap: function() {
      this.mapbox = L.mapbox.map(this.mapDiv(), 'automatic.i86oppa4', { zoomControl: false });
      this.pathsLayer = L.mapbox.featureLayer();
      this.markersLayer = L.mapbox.featureLayer();
      this.hardBrakesLayer = L.mapbox.featureLayer();
      this.hardAccelsLayer = L.mapbox.featureLayer();
      this.speedingLayer = L.mapbox.featureLayer();
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

      var self = this,
          mapbox = this.mapbox,
          pathsLayer = this.pathsLayer,
          markersLayer = this.markersLayer,
          markers = this.markers;


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
          var startMarker = mapHelpers.createMarker('start', model);
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
          var endMarker = mapHelpers.createMarker('end', model);
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

      this.updateTripEvents();
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


    updateTripEvents: function() {
      this.tripEvents = this.calculateTripEvents();
      this.toggleTripEvents();

      this.speedingLayer.clearLayers();
      this.hardBrakesLayer.clearLayers();
      this.hardAccelsLayer.clearLayers();
    },


    calculateTripEvents: function() {
      return this.collection.reduce(function(memo, trip) {
        memo.hardBrakes += trip.get('hard_brakes');
        memo.speeding += trip.get('duration_over_70_min');
        memo.hardAccels += trip.get('hard_accels');

        return memo;
      }, {hardBrakes: 0, speeding: 0, hardAccels: 0});
    },


    toggleTripEvents: function() {
      if($('.showTripEvents').is(':checked')) {
        this.showTripEvents();
      } else {
        this.hideTripEvents();
      }
    },


    showTripEvents: function() {
      $('#map .hardBrakes, #map .speeding, #map .hardAccels').removeClass('blank');
      $('#map .hardBrakes')
        .text(this.tripEvents.hardBrakes)
        .toggleClass('noHardBakes', (this.tripEvents.hardBrakes === 0));
      $('#map .hardAccels')
        .text(this.tripEvents.hardAccels)
        .toggleClass('noHardAccels', (this.tripEvents.hardAccels === 0));
      $('#map .speeding')
        .text(this.tripEvents.speeding)
        .toggleClass('noSpeeding', (this.tripEvents.speeding === 0));

      // If speeding layer is empty, calculate tripEvents layers (expensive)
      if(!this.speedingLayer.getLayers().length) {
        this.buildTripEventsLayer();
      }

      this.mapbox.addLayer(this.speedingLayer);
      this.mapbox.addLayer(this.hardBrakesLayer);
      this.mapbox.addLayer(this.hardAccelsLayer);
    },


    buildTripEventsLayer: function() {
      var self = this;

      this.collection.each(function(model) {
        model.get('drive_events').forEach(function(item) {
          var decodedPath = L.GeoJSON.decodeLine(model.get('path'));

          if(item.type === 'hard_brake') {
            self.hardBrakesLayer.addLayer(L.marker([item.lat, item.lon], {icon: mapHelpers.hardBrakeIcon}));
          } else if(item.type === 'hard_accel') {
            self.hardAccelsLayer.addLayer(L.marker([item.lat, item.lon], {icon: mapHelpers.hardAccelIcon}));
          } else if(item.type === 'speeding') {
            var speedingPath = mapHelpers.subPath(formatters.m_to_mi(item.start_distance_m), formatters.m_to_mi(item.end_distance_m), decodedPath);
            self.speedingLayer.addLayer(L.polyline(speedingPath, mapHelpers.speedingLine()));
          }
        });
      });

    },


    hideTripEvents: function() {
      $('#map .tripEventsBox .hardBrakes')
        .addClass('blank')
        .removeClass('noHardBrakes');

      $('#map .tripEventsBox .speeding')
        .addClass('blank')
        .removeClass('noSpeeding');

      $('#map .tripEventsBox .hardAccels')
        .addClass('blank')
        .removeClass('noHardAccels');

      this.mapbox.removeLayer(this.hardBrakesLayer);
      this.mapbox.removeLayer(this.hardAccelsLayer);
      this.mapbox.removeLayer(this.speedingLayer);
    },


    onShow: function () {
      this.updateMap();
    }

  });

});
