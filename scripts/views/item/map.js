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
      this.collection.on('sync', _.bind(this.updateMap, this));
      window.map = this;
      coms.on('focus', _.bind(this.focusMap, this))
      // this.collection.on('filter', _.bind(this.updateMap, this));
    },

    collection: trips,

    template: MapTmpl,

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {},

    /* on render callback */
    onRender: function () {},

    focusMap: function (model) {
      var path = model.get('path');
      var polyline = L.Polyline.fromEncoded(path);
      this.mapbox.fitBounds(polyline.getBounds());
    },

    updateMap: function () {
      var mapbox = this.mapbox = L.mapbox.map(this.el, 'sammery.i5bn5bmp');

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
            opacity: 0.9
          }).addTo(mapbox);
        }

        var featureLayer = L.mapbox.featureLayer({
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: s
            },
            properties:{
              title:"Start"
            },
          },{
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: e
            },
            properties:{
              title:"Finish"
            },
          }]
        })

        .on('click', function() {
          if (polyline) {
            mapbox.fitBounds(polyline.getBounds());
          } else {
            mapbox.fitBounds(featureLayer.getBounds());
          }

        }).addTo(mapbox);
      }), this);

    }

  });

});
