define([
  'backbone',
  'views/item/empty',
  'views/item/trip',
  '../../collections/trips',
  'communicator',
  'hbs!tmpl/item/trips_list_tmpl'
],
function( Backbone, Empty, Trip, trips, coms, tripList) {
  'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.CompositeView.extend({

    initialize: function() {
      console.log("initialize a Trips CollectionView");
      coms.on('filter', _.bind(this.resetCollection, this));
    },

    model: new Backbone.Model({}),
    collection: trips,
    emptyView: Empty,
    itemView: Trip,
    itemViewContainer: "ul",
    template: tripList,

    resetCollection: function (collection) {
      this.collection.reset(collection.toArray());
    },

    export: function (e) {
      var ids = [];
      if (e.target.value === 'selected'){
        var selected = this.collection.where({selected: true});
        ids = new Backbone.Collection(selected).pluck("id");
        if (!ids[0]) return alert('Please Select a Trip Or Five');
      }

      window.location = '/download/trips.csv?trip_ids=' + ids.join(',');
    },

    templateHelpers: function() {
      return {total: this.collection.length};
    },

    logit: function () {
      console.log(arguments);
    },


    events: {
      'change #exporter': 'export'
    },

    collectionEvents: {
      'sort': 'render',
      'reset': 'render',
      'sync': 'render'
    },

    /* on render callback */
    onRender: function() {
      console.log(arguments)
    }
  });

});

