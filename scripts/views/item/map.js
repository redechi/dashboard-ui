define([
  'backbone',
  'mapbox',
  '../../communicator',
  'hbs!tmpl/item/map_tmpl',
  '../../controllers/unit_formatters',
  '../../controllers/map_helpers',
  '../../controllers/analytics'
],
function( Backbone, mapbox, coms, MapTmpl, formatters, mapHelpers, analytics ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      coms.on('trips:highlight', _.bind(this.highlightTrips, this));
      coms.on('trips:unhighlight', _.bind(this.unhighlightTrips, this));
      coms.on('trips:select', _.bind(this.selectTrip, this));
      coms.on('trips:deselect', _.bind(this.deselectTrip, this));
      coms.on('trips:changeSelectedTrips', _.bind(this.changeSelectedTrips, this));
      coms.on('filter', _.bind(this.resetView, this));
    },

    collection: new Backbone.Collection([]),

    resetView: function (collection) {
      this.collection.reset(collection);
      this.updateMap();
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
      this.mapbox = L.mapbox.map(this.mapDiv(), 'automatic.idonii25', { zoomControl: false, attributionControl: false});
      this.mapbox.addControl(L.control.attribution({position: 'bottomleft', prefix: false}));
      this.pathsLayer = L.mapbox.featureLayer();
      this.markersLayer = L.mapbox.featureLayer();
      this.hardBrakesLayer = L.mapbox.featureLayer();
      this.hardAccelsLayer = L.mapbox.featureLayer();
      this.speedingLayer = L.mapbox.featureLayer();

      mapHelpers.enablePolyline();

      this.mapbox.addLayer(this.markersLayer);
      this.mapbox.addLayer(this.pathsLayer);

      this.mapbox.on('zoomend', _.bind(this.scaleMarkers, this));
    },


    highlightTrips: function (trips) {
      var self = this;

      trips.forEach(function(model) {
        var path = self.pathsLayer.getLayer(model.get('pathID')),
            startMarker = self.markersLayer.getLayer(model.get('startMarkerID')),
            endMarker = self.markersLayer.getLayer(model.get('endMarkerID'));

        if(path) {
          path
            .bringToFront()
            .setStyle(mapHelpers.highlightLine(self.zoom));
        }

        if(startMarker) {
          mapHelpers.highlightMarker(startMarker);
        }

        if(endMarker) {
          mapHelpers.highlightMarker(endMarker);
        }
        if(self.speedingLayer.getLayers().length) {
          self.speedingLayer.bringToFront();
        }
      });
    },


    unhighlightTrips: function (trips) {
      var self = this;

      trips.forEach(function(model) {
        var path = self.pathsLayer.getLayer(model.get('pathID')),
            startMarker = self.markersLayer.getLayer(model.get('startMarkerID')),
            endMarker = self.markersLayer.getLayer(model.get('endMarkerID'));

        if(model.get('selected')) {
          if(path) {
            path.setStyle(mapHelpers.selectedLine(self.zoom));
          }

          if(startMarker) {
            mapHelpers.selectMarker(startMarker);
          }

          if(endMarker) {
            mapHelpers.selectMarker(endMarker);
          }
        } else {
          if(path) {
            path.setStyle(mapHelpers.styleLine(self.zoom));
          }

          if(startMarker) {
            startMarker.setIcon(mapHelpers.mainIconSmall);
          }

          if(endMarker) {
            endMarker.setIcon(mapHelpers.mainIconSmall);
          }
        }
      });
    },


    selectTrip: function (model) {
      var path = this.pathsLayer.getLayer(model.get('pathID')),
          startMarker = this.markersLayer.getLayer(model.get('startMarkerID')),
          endMarker = this.markersLayer.getLayer(model.get('endMarkerID'));

      if(path) {
        path
          .bringToFront()
          .setStyle(mapHelpers.selectedLine(this.zoom));
      }

      if(startMarker) {
        mapHelpers.selectMarker(startMarker);
        startMarker.options.selected = true;
      }

      if(endMarker) {
        mapHelpers.selectMarker(endMarker);
        endMarker.options.selected = true;
      }

      if(this.speedingLayer.getLayers().length) {
        this.speedingLayer.bringToFront();
      }
    },


    deselectTrip: function (model) {
      var path = this.pathsLayer.getLayer(model.get('pathID')),
          startMarker = this.markersLayer.getLayer(model.get('startMarkerID')),
          endMarker = this.markersLayer.getLayer(model.get('endMarkerID'));

      if(path) {
        path.setStyle(mapHelpers.styleLine(this.zoom));
      }

      if(startMarker) {
        startMarker.setIcon(mapHelpers.mainIconSmall);
        startMarker.options.selected = false;
      }

      if(endMarker) {
        endMarker.setIcon(mapHelpers.mainIconSmall);
        endMarker.options.selected = false;
      }

    },


    changeSelectedTrips: function() {
      var self = this,
          selectedTrips = this.collection.where({selected: true});

      var bounds = selectedTrips.reduce(function(memo, trip) {
        var path = self.pathsLayer.getLayer(trip.get('pathID'));
        if(path) {
          var pathBounds = path.getBounds();
          if(!memo) {
            memo = pathBounds;
          } else {
            memo.extend(pathBounds);
          }
        }
        return memo;
      }, null);

      this.fitBounds(bounds || this.pathsLayer.getBounds());
    },


    clearMap: function() {
      this.pathsLayer.clearLayers();
      this.markersLayer.clearLayers();
    },


    addTripToMap: function(model) {
      var path = model.get('path'),
          startLoc = model.get('start_location'),
          endLoc = model.get('end_location');

      //Add Path
      if(path) {
        var decodedLine = L.GeoJSON.decodeLine(model.get('path')),
            line = L.polyline(decodedLine, this.pathStyle).addTo(this.pathsLayer);

        if(this.options.layout !== 'single_trip') {
          model.set('pathID', line._leaflet_id);

          line.on('mouseover', function() {
            coms.trigger('trips:highlight', [model]);
          })
          .on('mouseout', function() {
            coms.trigger('trips:unhighlight', [model]);
          })
          .on('click', function() {
            coms.trigger('trips:toggleSelect', [model], {scroll: true});
            analytics.trackEvent('select trip from map', 'click');
          });
        }
      }

      //Add Start Location
      if(startLoc) {
        var options = {icon: this.aIcon, type: 'start', id: model.get('id')},
            latlon = [startLoc.lat, startLoc.lon],
            startMarker = L.marker(latlon, options).addTo(this.markersLayer);

        if(this.options.layout !== 'single_trip') {
          model.set('startMarkerID', startMarker._leaflet_id);

          startMarker.on('click', function() {
            coms.trigger('trips:toggleSelect', [model], {scroll: true});
            analytics.trackEvent('select trip from map', 'click');
          });
        }
      }

      //Add End Location
      if(endLoc) {
        var options = {icon: this.bIcon, type: 'end', id: model.get('id')},
            latlon = [endLoc.lat, endLoc.lon],
            endMarker = L.marker(latlon, options).addTo(this.markersLayer);

        if(this.options.layout !== 'single_trip') {
          model.set('endMarkerID', endMarker._leaflet_id);

          endMarker.on('click', function() {
            coms.trigger('trips:toggleSelect', [model], {scroll: true});
          });
        }
      }
    },


    updateMap: function () {
      if(!this.mapDiv()) {
        return;
      } else if(!this.mapbox) {
        this.createMap();
      } else {
        this.clearMap();
      }

      if(this.options.layout === 'single_trip') {
        this.pathStyle = mapHelpers.highlightLine(this.zoom);
        this.aIcon = mapHelpers.aLargeIcon;
        this.bIcon = mapHelpers.bLargeIcon;
      } else {
        this.pathStyle = mapHelpers.styleLine(this.zoom);
        this.aIcon = mapHelpers.mainIconSmall;
        this.bIcon = mapHelpers.mainIconSmall;
      }

      this.collection.each(_.bind(this.addTripToMap, this));

      this.fitBounds();

      this.updateTripEvents();
    },


    fitBounds: function(bounds) {
      this.mapbox.invalidateSize();
      if(!bounds) {
        bounds = this.pathsLayer.getBounds();
      }
      if(bounds.isValid()) {
        this.mapbox.fitBounds(bounds, {padding: [45, 45]});
      }
    },


    zoomIn: function() {
      this.mapbox.zoomIn();
      analytics.trackEvent('map zoom in', 'click');
    },


    zoomOut: function() {
      this.mapbox.zoomOut();
      analytics.trackEvent('map zoom out', 'click');
    },


    scaleMarkers: function() {
      this.zoom = this.mapbox.getZoom();

      var self = this,
          normalIcon = mapHelpers.getMarkerSizeByZoom(this.zoom, 'normal'),
          hardBrakeIcon = mapHelpers.getMarkerSizeByZoom(this.zoom, 'hardBrake'),
          hardAccelIcon = mapHelpers.getMarkerSizeByZoom(this.zoom, 'hardAccel'),
          weight = mapHelpers.getPathWidthbyZoom(this.zoom);

      this.markersLayer.eachLayer(function(marker) {
        if(!marker.options.selected && self.options.layout !== 'single_trip') {
          marker.setIcon(normalIcon);
        }
      });

      this.pathsLayer.eachLayer(function(path) {
        path.setStyle({weight: weight});
      });

      this.speedingLayer.eachLayer(function(path) {
        path.setStyle({weight: weight});
      });

      this.hardBrakesLayer.eachLayer(function(marker) {
        marker.setIcon(hardBrakeIcon);
      });

      this.hardAccelsLayer.eachLayer(function(marker) {
        marker.setIcon(hardAccelIcon);
      });
    },


    updateTripEvents: function() {
      this.tripEvents = this.calculateTripEvents();
      this.showTripEventsSummary();

      this.speedingLayer.clearLayers();
      this.hardBrakesLayer.clearLayers();
      this.hardAccelsLayer.clearLayers();

      $('.showTripEvents', this.$el).prop('checked', !!window.options.showTripEvents);

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
      $('.tripEvents .hardBrakes', this.$el)
        .text(this.tripEvents.hardBrakes)
        .toggleClass('none', (this.tripEvents.hardBrakes === 0));
      $('.tripEvents  .hardAccels', this.$el)
        .text(this.tripEvents.hardAccels)
        .toggleClass('none', (this.tripEvents.hardAccels === 0));
      if(this.tripEvents.speeding === 0) {
        $('.tripEvents  .speeding', this.$el)
          .text(this.tripEvents.speeding)
          .addClass('none')
          .removeClass('hours days');
      }else if(this.tripEvents.speeding < 60) {
        $('.tripEvents  .speeding', this.$el)
          .text(this.tripEvents.speeding)
          .removeClass('none days hours');
      } else if(this.tripEvents.speeding < 5940) {
        $('.tripEvents  .speeding', this.$el)
          .text(Math.round(this.tripEvents.speeding / 60))
          .removeClass('none days')
          .addClass('hours');
      } else {
        $('.tripEvents  .speeding', this.$el)
          .text(Math.round(this.tripEvents.speeding / (60 * 24)))
          .removeClass('none hours')
          .addClass('days');
      }
    },


    toggleTripEvents: function(e) {
      window.options.showTripEvents = $('.showTripEvents', this.$el).is(':checked');
      if(window.options.showTripEvents) {
        this.showTripEventsMap();
        if(e) {
          analytics.trackEvent('trip events', 'click');
        }
      } else {
        this.hideTripEvents();
      }
    },


    showTripEventsMap: function() {
      $('.tripEvents', this.$el).removeClass('grey');

      // If speeding layer is empty, calculate tripEvents layers (expensive)
      if(!this.speedingLayer.getLayers().length) {
        this.buildTripEventsLayer();
      }

      this.mapbox.addLayer(this.speedingLayer);
      this.mapbox.addLayer(this.hardBrakesLayer);
      this.mapbox.addLayer(this.hardAccelsLayer);
    },


    buildTripEventsLayer: function() {
      var self = this,
          speedingLine = mapHelpers.speedingLine(this.zoom),
          hardBrakeIcon = mapHelpers.getMarkerSizeByZoom(this.zoom, 'hardBrake'),
          hardAccelIcon = mapHelpers.getMarkerSizeByZoom(this.zoom, 'hardAccel');

      this.collection.each(function(trip) {
        if(trip.get('path')) {
          var decodedPath = L.GeoJSON.decodeLine(trip.get('path'));

          trip.get('drive_events').forEach(function(item) {
            if(item.type === 'hard_brake') {
              self.hardBrakesLayer.addLayer(L.marker([item.lat, item.lon], {icon: hardBrakeIcon, id: trip.get('id')}));
            } else if(item.type === 'hard_accel') {
              self.hardAccelsLayer.addLayer(L.marker([item.lat, item.lon], {icon: hardAccelIcon, id: trip.get('id')}));
            } else if(item.type === 'speeding') {
              var start = formatters.m_to_mi(item.start_distance_m),
                  end = formatters.m_to_mi(item.end_distance_m),
                  speedingPath = mapHelpers.subPath(start, end, decodedPath),
                  lineOptions = _.extend({id: trip.get('id')}, speedingLine);
              self.speedingLayer.addLayer(L.polyline(speedingPath, lineOptions));
            }
          });
        }
      });

    },


    hideTripEvents: function() {
      $('.tripEvents', this.$el).addClass('grey');

      this.mapbox.removeLayer(this.hardBrakesLayer);
      this.mapbox.removeLayer(this.hardAccelsLayer);
      this.mapbox.removeLayer(this.speedingLayer);
    },


    onShow: function () {
      this.updateMap();
      if(this.options.layout === 'single_trip') {
        $('.showTripEvents', this.$el).prop('checked', true);
        this.toggleTripEvents();
      }
    }

  });

});
