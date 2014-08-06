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


    highlightAll: function() {
      this.pathsLayer.eachLayer(function(layer) {
        layer.setStyle(mapHelpers.highlightLine());
        layer.removeEventListener('mouseover');
        layer.removeEventListener('mouseout');
      });

      this.markersLayer.eachLayer(function(marker) {
        mapHelpers.highlightMarker(marker, {type: 'large'});
        marker.removeEventListener('click');
        marker.removeEventListener('popupclose');
      });
    },


    highlightTrip: function (model) {
      var id = model.get('id');

      var path = this.pathsLayer.getLayer(model.get('pathID'));

      if(path) {
        path
          .bringToFront()
          .setStyle(mapHelpers.highlightLine());
      }

      this.markersLayer.eachLayer(function(marker) {
        if(marker.options.id === id) {
          mapHelpers.highlightMarker(marker);
        }
      });

      this.speedingLayer.eachLayer(function(layer) {
        if(layer.options.id === id) {
          layer.bringToFront();
          layer.setStyle(mapHelpers.highlightSpeedingLine());
        }
      });
    },


    unhighlightTrip: function (model) {
      var id = model.get('id');

      //don't unhighlight selected trips
      if(!model.get('selected')) {
        var path = this.pathsLayer.getLayer(model.get('pathID'));

        if(path) {
          path.setStyle(mapHelpers.styleLine());
        }

        this.markersLayer.eachLayer(function(marker) {
          if(marker.options.id === id) {
            marker.setIcon(mapHelpers.mainIcon);
          }
        });

        this.speedingLayer.eachLayer(function(layer) {
          if(layer.options.id === id) {
            layer.setStyle(mapHelpers.speedingLine());
          }
        });
      }
    },


    changeSelectedTrips: function() {
      var self = this,
          selectedTrips = this.collection.where({selected: true}),
          bounds;

      if(selectedTrips.length) {
        bounds = selectedTrips.reduce(function(memo, trip) {
          var pathBounds = self.pathsLayer.getLayer(trip.get('pathID')).getBounds();
          if(!memo) {
            memo = pathBounds;
          } else {
            memo.extend(pathBounds);
          }
          return memo;
        }, null);


      } else {
        bounds = this.pathsLayer.getBounds();
      }
      this.fitBounds(bounds);
    },


    clearMap: function() {
      this.pathsLayer.clearLayers();
      this.markersLayer.clearLayers();
      this.markers = [];
    },


    updateMap: function () {
      var self = this;

      if(!this.mapDiv()) {
        return;
      } else if(!this.mapbox) {
        this.createMap();
      } else {
        this.clearMap();
      }

      this.collection.each(function(model) {
        var startLoc = model.get('start_location'),
            endLoc = model.get('end_location'),
            path = model.get('path');

        if (path) {
          var line = L.polyline(L.GeoJSON.decodeLine(path), mapHelpers.styleLine()).addTo(self.pathsLayer);
          line.on('mouseover', function() {
            coms.trigger('trips:highlight', model);
          })
          .on('mouseout', function() {
            coms.trigger('trips:unhighlight', model);
          });

          model.set('pathID', line._leaflet_id);
        }

        if (startLoc) {
          var startMarker = mapHelpers.createMarker('start', model);
          startMarker.on('click', function(e) {
            coms.trigger('trips:highlight', model);
          })
          .on('popupclose', function() {
            coms.trigger('trips:unhighlight', model);
          });

          self.markers.push(startMarker);
          self.markersLayer.addLayer(startMarker);
        }

        if (endLoc) {
          var endMarker = mapHelpers.createMarker('end', model);
          endMarker.on('click', function(e) {
            coms.trigger('trips:highlight', model);
          })
          .on('popupclose', function() {
            coms.trigger('trips:unhighlight', model);
          });

          self.markers.push(endMarker);
          self.markersLayer.addLayer(endMarker);
        }
      });

      this.mapbox.addLayer(this.pathsLayer);

      this.fitBounds(this.pathsLayer.getBounds());

      this.updateTripEvents();
    },


    fitBounds: function(bounds) {
      this.mapbox.invalidateSize();
      if(bounds.isValid()) {
        this.mapbox.fitBounds(bounds, {padding: [20, 20]});
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

      $('.showTripEvents').prop('checked', !!window.options.showTripEvents);

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
      window.options.showTripEvents = $('.showTripEvents').is(':checked');
      if(window.options.showTripEvents) {
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

      this.collection.each(function(trip) {
        var decodedPath = L.GeoJSON.decodeLine(trip.get('path'));

        trip.get('drive_events').forEach(function(item) {
          if(item.type === 'hard_brake') {
            self.hardBrakesLayer.addLayer(L.marker([item.lat, item.lon], {icon: mapHelpers.hardBrakeIcon, id: trip.get('id')}));
          } else if(item.type === 'hard_accel') {
            self.hardAccelsLayer.addLayer(L.marker([item.lat, item.lon], {icon: mapHelpers.hardAccelIcon, id: trip.get('id')}));
          } else if(item.type === 'speeding') {
            var start = formatters.m_to_mi(item.start_distance_m),
                end = formatters.m_to_mi(item.end_distance_m),
                speedingPath = mapHelpers.subPath(start, end, decodedPath),
                lineOptions = _.extend({id: trip.get('id')}, mapHelpers.speedingLine());
            self.speedingLayer.addLayer(L.polyline(speedingPath, lineOptions));
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
