define([
  'backbone',
  'views/item/empty',
  'views/item/trip',
  'communicator',
  'hbs!tmpl/composite/trips_list_tmpl'
],
function( Backbone, Empty, Trip, coms, tripList) {
  'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.CompositeView.extend({

    initialize: function() {
      console.log("initialize a Trips CollectionView");

      coms.on('filter', _.bind(this.resetCollection, this));

      $(window).on("resize", this.resize);
    },

    model: new Backbone.Model({}),
    collection: new Backbone.Collection([]),
    emptyView: Empty,
    childView: Trip,
    childViewContainer: "ul",
    template: tripList,

    resetCollection: function (collection) {
      this.collection.reset(collection);
    },

    templateHelpers: function () {
      return {
        total: this.collection.length
      };
    },

    export: function (e) {
      var ids = [];
      if (e.target.value === 'selected'){
        var selected = this.collection.where({selected: true});
        ids = new Backbone.Collection(selected).pluck("id");
        if (!ids[0]) return alert('Please Select at least one trip');
      } else if (e.target.value === 'filtered'){
        var filtered = this.collection.models;
        ids = new Backbone.Collection(filtered).pluck("id");
        if (!ids[0]) return alert('Please Select at least one trip');
      }

      window.location = '/download/trips.csv?trip_ids=' + ids.join(',');
    },

    logit: function () {
      console.log(arguments);
    },

    changeSort: function () {
      var sortType = this.$el.find('.sortType').val();
      this.collection.sortType = sortType;

      this.collection.comparator = function(trip) { return -trip.get(sortType); };
      this.collection.sort();
    },

    events: {
      'click #export li': 'export',
      'change .sortType': 'changeSort'
    },

    collectionEvents: {
      'sort': 'render',
      'reset': 'render',
      'sync': 'render'
    },

    /* on render callback */
    onRender: function() {
      //set sortType dropdown
      this.$el.find('.sortType').val(this.collection.sortType);

      var resize = this.resize;
      setTimeout(resize, 0);

      // initialize export popover
      setTimeout(function() {
        $('.btn-export').popover({
          html: true,
          placement: 'top',
          content: '<ul id="export"><li data-type="all">All</li><li data-type="selected">Selected</li></ul>'
        });
      }, 0);
    },

    resize: function() {
      var height = $(window).height() - $('header').outerHeight(true) - $('#filters').outerHeight(true);
      $('#trips ul.trips').height(height - $('#tripsHeader').outerHeight(true) - $('#tripsFooter').outerHeight(true) - 95);
    }

  });

});
