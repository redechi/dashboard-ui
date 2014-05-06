define([
  'backbone',
  'hbs!tmpl/item/trip_tmpl'
],
function( Backbone, TripTmpl  ) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a Trip ItemView");
    },

    /* on render callback */
    onRender: function () {
      var polyline = undefined,
          id = this.model.get('id'),
          startLoc = this.model.get('start_location'),
          endLoc = this.model.get('end_location'),
          path = this.model.get('path');
 
      var s = [startLoc.lon,startLoc.lat];
      var e = [endLoc.lon,endLoc.lat];

      var map = L.mapbox.map(this.$el.find('#tripmap'+id)[0], 'examples.map-9ijuk24y');

      /*
      // disable drag and zoom handlers
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      if (map.tap) map.tap.disable();
      */

      if (path) {
        polyline = L.Polyline.fromEncoded(path, {
          color: '#08b1d5',
          opacity: 0.9
        }).addTo(map);
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
        console.log('on ready triggered')

        if (polyline) {
          map.fitBounds(polyline.getBounds());
        } else {
          map.fitBounds(featureLayer.getBounds());
        }

      }).addTo(map);

    },

    template: TripTmpl,

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {},

  });

});
