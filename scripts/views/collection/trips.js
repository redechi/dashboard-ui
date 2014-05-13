define([
  'backbone',
  'views/item/empty',
  'views/item/trip',
  '../../collections/trips'
],
function( Backbone, Empty, Trip, TripsCollection) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.CollectionView.extend({

    initialize: function() {
      this.render();
      this.collection.fetch();
      this.listenTo(this.collection, "reset", this.render);
      this.listenTo(this.collection, "sort", this.render);
      console.log("initialize a Trips CollectionView");
    },

    collection: new TripsCollection(),

    emptyView: Empty,

    itemView: Trip,

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {},

    /* on render callback */
    onRender: function() {}
  });

});
