define([
  'backbone',
  'hbs!tmpl/item/map_tmpl',
  '../../collections/trips'
],
function( Backbone, MapTmpl, trips ) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a Map ItemView");
      this.collection.on('sync', _.bind(this.updateMap, this));
      this.collection.on('filter', _.bind(this.updateMap, this));
    },

    collection: trips,

    template: MapTmpl,

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {},

    /* on render callback */
    onRender: function () {},

    updateMap: function () {
      var mapbox = L.mapbox.map(this.el, 'sammery.i5bn5bmp');

      this.collection.each(_.bind(function (model) {
        var polyline = undefined, 
        id = model.get('id'),
        startLoc = model.get('start_location'),
        endLoc = model.get('end_location'),
        path = model.get('path');
        
        var s = [startLoc.lon,startLoc.lat];
        var e = [endLoc.lon,endLoc.lat];

        if (path) {
          polyline = L.Polyline.fromEncoded(path, {
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
          console.log('on ready triggered')

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
