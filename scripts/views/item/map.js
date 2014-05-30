define([
  'backbone',
  '../../communicator',
  'hbs!tmpl/item/map_tmpl',
  '../../collections/trips',
  'polyline'
],
function( Backbone, coms, MapTmpl, trips, P/* not used */) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a Map ItemView");
      coms.on('focus', _.bind(this.focusMap, this))
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
      var path = model.get('path');
      var polyline = L.Polyline.fromEncoded(path);
      this.mapbox.fitBounds(polyline.getBounds());
    },

    updateMap: function () {
      var mapbox = this.mapbox = L.mapbox.map(this.el, 'sammery.i5bn5bmp');
      var geoJson = {
        type: "FeatureCollection",
        features: []
      };

      this.collection.each(_.bind(function (model) {
        var id = model.get('id'),
        startLoc = model.get('start_location'),
        endLoc = model.get('end_location'),
        path = model.get('path');

        var s = [startLoc.lon,startLoc.lat];
        var e = [endLoc.lon,endLoc.lat];

        if (path) {
          var polyline = L.Polyline.fromEncoded(path, {
            color: '#08b1d5',
            id: model.get('id'),
            opacity: 0.9
          }).addTo(mapbox)
          .on('mouseover', function (e) {
            // get model from id
            var newModel = trips.where({id: e.target.options.id }).pop();
            coms.trigger('map:focus', newModel);
          });
        }

        geoJson.features.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: s
          },
          properties:{
            title:"Start",
            id: model.get('id')
          },
        });

        geoJson.features.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: e
          },
          properties:{
            title:"Finish",
            id: model.get('id')
          },
        });

      }), this);

      var featureLayer = L.mapbox.featureLayer(geoJson)
        .on('click', function(e) {
          mapbox.fitBounds(e.target.getBounds());
        }).addTo(mapbox);

      // wierd timeout hack for mapbox
      setTimeout(function () {
        mapbox.fitBounds(featureLayer.getBounds());
      }, 0)
    }

  });

});
