define([
  'backbone',
  'mapbox',
  'hbs!tmpl/item/map_single_tmpl',
  '../../collections/trips',
  '../../controllers/unit_formatters',
  '../../controllers/map_helpers'
],
function( Backbone, mapbox, MapSingleTmpl, trips, formatters, mapHelpers) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a Single Map ItemView");
    },

    collection: trips,

    template: MapSingleTmpl,

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {},

    /* on render callback */
    onRender: function () {
      this.createMap();
    },

    templateHelpers: function() {
      var trip = this.collection.models[0];

      return {
        hard_brakes: trip.get('hard_brakes'),
        hard_accels: trip.get('hard_accels'),
        duration_over_70_min: Math.ceil(trip.get('duration_over_70_s') / 60)
      };
    },

    createMap: function() {
      _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g
      };

      var mapbox = L.mapbox.map(this.$el.find('.map').get(0), 'automatic.i86oppa4'),
          featureLayer = L.mapbox.featureLayer(),
          geoJson = L.geoJson([], { style: mapHelpers.styleLine }),
          model = this.collection.models[0],
          startLoc = model.get('start_location'),
          endLoc = model.get('end_location'),
          path = model.get('path'),
          popupTemplate = _.template('{{name}}<br>{{time}}');

      mapHelpers.enablePolyline();

      mapbox.addLayer(featureLayer);

      if (path) {
        geoJson.addData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: L.GeoJSON.decodeLine(path)
          }
        }).addTo(featureLayer);
      }

      if (startLoc) {
        featureLayer.addLayer(mapHelpers.createMarker('start', model, popupTemplate));
      }

      if (endLoc) {
        featureLayer.addLayer(mapHelpers.createMarker('end', model, popupTemplate));
      }

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
