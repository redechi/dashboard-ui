define([
  'backbone',
  'views/item/empty',
  'views/item/trip',
  '../../collections/trips',
  'communicator',
  '../../controllers/unit_formatters',
  'hbs!tmpl/item/trips_list_tmpl'
],
function( Backbone, Empty, Trip, trips, coms, formatters, tripList) {
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
    collection: new Backbone.Collection([]),
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
      var helpers =  {
        total: this.collection.length,
        distance: formatters.distance(this.collection.reduce(function(memo, trip) { return memo + trip.get('distance_miles'); }, 0)),
        duration: formatters.duration(this.collection.reduce(function(memo, trip) { return memo + trip.get('duration'); }, 0)),
        // score: formatters.score(this.collection.getAverageScore()),
        cost: formatters.cost(this.collection.reduce(function(memo, trip) { return memo + trip.get('fuel_cost_usd'); }, 0))
      };

      helpers.mpg = formatters.averageMPG(helpers.distance / this.collection.reduce(function(memo, trip) { return memo + trip.get('fuel_volume_gal'); }, 0))

      return helpers;
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
      this.collection.forEach(function(trip) {
        $('.trip[data-trip_id="' + trip.id + '"]').addClass('highlighted');
      });
    },

    unhighlightTrips: function() {
      $('.trips').removeClass('highlighted');
      $('.trip').removeClass('highlighted');
    },

    changeSort: function () {
      // TODO: implement sort
    },

    events: {
      'change #exporter': 'export',
      'change .sortType': 'changeSort'
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
