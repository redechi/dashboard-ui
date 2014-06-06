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

      coms.on('trips:highlight', _.bind(this.highlightTrip, this));
      coms.on('trips:unhighlight', _.bind(this.unhighlightTrips, this));

      $(window).on("resize", this.resize);
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
        if (!ids[0]) return alert('Please Select at least one trip');
      } else if (e.target.value === 'filtered'){
        var filtered = this.collection.models
        ids = new Backbone.Collection(filtered).pluck("id");
        if (!ids[0]) return alert('Please Select at least one trip');
      }

      window.location = '/download/trips.csv?trip_ids=' + ids.join(',');
    },

    templateHelpers: function() {
      return {total: this.collection.length};
    },

    logit: function () {
      console.log(arguments);
    },

    highlightTrip: function(trip) {
      if(!trip) { return; }
      this.highlightTrips([trip]);
    },

    highlightTrips: function (trips) {
      $('.trips').addClass('highlighted');
      $('.trips .trip').removeClass('highlighted');
      trips.forEach(function(trip) {
        $('.trip[data-trip_id="' + trip.id + '"]').addClass('highlighted');
      });
    },

    unhighlightTrips: function() {
      $('.trips').removeClass('highlighted');
      $('.trip').removeClass('highlighted');
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
      var resize = this.resize;
      setTimeout(resize, 0);
    },

    resize: function() {
      var height = $(window).height() - $('header').outerHeight(true) - $('#filters').outerHeight(true);
      $('#trips ul.trips').height(height - $('#tripsHeader').outerHeight(true) - $('#tripsFooter').outerHeight(true) - 75);
    }

  });

});
