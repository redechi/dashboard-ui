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
      coms.on('trips:highlight', _.bind(this.highlightTrip, this));
      coms.on('trips:unhighlight', _.bind(this.unhighlightTrip, this));
      coms.on('trips:select', _.bind(this.changeSelectedTrips, this));
      coms.on('trips:deselect', _.bind(this.changeSelectedTrips, this));
      coms.on('filter', _.bind(this.resetCollection, this));
    },

    collection: new Backbone.Collection([]),

    resetCollection: function (collection) {
      this.collection.reset(collection);
    },

    collectionEvents: {
      'reset': 'updateMap'
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
      L.mapbox.accessToken = 'pk.eyJ1IjoiYXV0b21hdGljIiwiYSI6IlNjM0FzVXcifQ.hn43-OTg0ZF4qGIGjFdapQ';
      this.mapbox = L.mapbox.map(this.mapDiv(), 'automatic.idonii25', { zoomControl: false });
      this.pathsLayer = L.mapbox.featureLayer();
      this.markersLayer = L.mapbox.featureLayer();
      this.hardBrakesLayer = L.mapbox.featureLayer();
      this.hardAccelsLayer = L.mapbox.featureLayer();
      this.speedingLayer = L.mapbox.featureLayer();
      this.markers = [];

      mapHelpers.enablePolyline();

      this.mapbox.addLayer(this.markersLayer);
    },


    highlightTrip: function (model) {
      var id = model.get('id');

      this.pathsLayer.eachLayer(function(layer) {
        if(layer.options.id == id) {
          layer.eachLayer(function(layer) {
            if(layer instanceof L.Polyline) {
              layer.bringToFront();
              layer.setStyle(mapHelpers.highlightLine());
            }
          });
        }
      });

      this.markersLayer.eachLayer(function(marker) {
        if(marker.options.id === id) {
          mapHelpers.highlightMarker(marker);
        }
      });
    },


    unhighlightTrip: function (model) {
      var id = model.get('id');

      //don't unhighlight selected trips
      if(!model.get('selected')) {
        this.pathsLayer.eachLayer(function(layer) {
          if(layer.options.id == id) {
            layer.eachLayer(function(layer) {
              if(layer instanceof L.Polyline) {
                layer.setStyle(mapHelpers.styleLine());
              }
            });
          }
        });

        this.markersLayer.eachLayer(function(marker) {
          if(marker.options.id === id) {
            marker.setIcon(mapHelpers.mainIcon);
          }
        });
      }
    },


    changeSelectedTrips: function() {
      var selectedTrips = this.collection.where({ selected: true }),
          bounds = (selectedTrips.length) ? mapHelpers.getBoundsFromTrips(selectedTrips) : this.pathsLayer.getBounds();
      this.fitBounds(bounds);
    },


    clearMap: function() {
      this.pathsLayer.clearLayers();
      this.markersLayer.clearLayers();
      this.markers = [];
    },


    attachEvents: function (feature, layer) {
      var model = this.collection.where({id: feature.properties.id }).pop();
      layer
        .on('mouseover', function () {
          coms.trigger('trips:highlight', model);
        })
        .on('mouseout', function () {
          coms.trigger('trips:unhighlight', model);
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
            coms.trigger('trips:highlight', model);
          })
          .on('popupclose', function () {
            coms.trigger('trips:unhighlight', model);
          });

          markers.push(startMarker);
          markersLayer.addLayer(startMarker);
        }

        if (endLoc) {
          var endMarker = mapHelpers.createMarker('end', model);
          endMarker.on('click', function (e) {
            coms.trigger('trips:highlight', model);
          })
          .on('popupclose', function () {
            coms.trigger('trips:unhighlight', model);
          });

          markers.push(endMarker);
          markersLayer.addLayer(endMarker);
        }

        geoJson.addTo(pathsLayer);
      });

      mapbox.addLayer(pathsLayer);

      this.fitBounds(this.pathsLayer.getBounds());

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
      this.showTripEventsSummary();

      this.speedingLayer.clearLayers();
      this.hardBrakesLayer.clearLayers();
      this.hardAccelsLayer.clearLayers();

      this.toggleTripEvents();
    },


    calculateTripEvents: function() {
      return this.collection.reduce(function(memo, trip) {
        memo.hardBrakes += trip.get('hard_brakes') || 0;
        memo.speeding += trip.get('duration_over_70_min') || 0;
        memo.hardAccels += trip.get('hard_accels') || 0;

        return memo;
      }, {hardBrakes: 0, speeding: 0, hardAccels: 0});
    },


    showTripEventsSummary: function() {
      $('#map .hardBrakes')
        .text(this.tripEvents.hardBrakes)
        .toggleClass('none', (this.tripEvents.hardBrakes === 0));
      $('#map .hardAccels')
        .text(this.tripEvents.hardAccels)
        .toggleClass('none', (this.tripEvents.hardAccels === 0));
      $('#map .speeding')
        .text(this.tripEvents.speeding)
        .toggleClass('none', (this.tripEvents.speeding === 0));
    },


    toggleTripEvents: function() {
      if($('.showTripEvents').is(':checked')) {
        this.showTripEventsMap();
      } else {
        this.hideTripEvents();
      }
    },


    showTripEventsMap: function() {
      $('#map .hardBrakes, #map .speeding, #map .hardAccels').removeClass('grey');

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
      $('#map .hardBrakes, #map .speeding, #map .hardAccels').addClass('grey');

      this.mapbox.removeLayer(this.hardBrakesLayer);
      this.mapbox.removeLayer(this.hardAccelsLayer);
      this.mapbox.removeLayer(this.speedingLayer);
    },


    onShow: function () {
      this.updateMap();
    }

  });

});
