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

      this.options.sortType = 'start_time';
      this.options.sortDirection = 'sortDown';
    },

    model: new Backbone.Model({}),
    collection: new Backbone.Collection([]),
    emptyView: Empty,
    childView: Trip,
    childViewContainer: "ul.trips",
    template: tripList,

    templateHelpers: function () {

      //check for export support
      var exportSupported = false;
      try {
        exportSupported = !!new Blob;
      } catch (e) {}

      return {
        total: this.collection.length,
        exportSupported: exportSupported
      };
    },

    events: {
      'click .exportOption li': 'export',
      'click .sortValue li': 'changeSort',
      'show.bs.popover .export': 'getTripCounts'
    },

    collectionEvents: {
      'reset': 'render',
      'sync': 'render'
    },

    resetCollection: function (collection) {
      this.collection.reset(collection);
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
    },

    changeSort: function (e) {
      if($(e.currentTarget).data('direction') === 'sortUp' || !$(e.currentTarget).hasClass('selected')) {
        this.options.sortDirection = 'sortDown';
      } else {
        this.options.sortDirection = 'sortUp';
      }
      this.options.sortType = $(e.currentTarget).data('value');
      this.options.sortTypeName = $(e.currentTarget).text();

      this.setSort();
    },

    setSort: function() {
      var sortType = this.options.sortType,
          sortTypeName = this.options.sortTypeName,
          sortDirection = this.options.sortDirection;
      $('.sortValue li').removeClass();
      $('.sortValue li[data-value="' + sortType + '"]')
        .data('direction', sortDirection)
        .addClass('selected')
        .addClass(sortDirection);

      $('.sortType').text(sortTypeName);

      this.collection.comparator = function(trip) {
        if(sortDirection == 'sortDown') {
          return -trip.get(sortType);
        } else {
          return trip.get(sortType);
        }
      };
      this.collection.sort();
    },

    enablePopovers: function() {
      $('.export').popover('destroy');
      var exportPopoverTemplate = $('.tripsFooter .popoverTemplate');
      $('.export').popover({
        html: true,
        content: function() { return exportPopoverTemplate.html(); },
        title:  function() { return exportPopoverTemplate.attr('title'); },
        placement: 'top'
      });

      $('.sortType').popover('destroy');
      var sortPopoverTemplate = $('.tripsHeader .popoverTemplate');
      $('.sortType').popover({
        html: true,
        content: function() { return sortPopoverTemplate.html(); },
        title:  function() { return sortPopoverTemplate.attr('title'); },
        placement: 'bottom'
      });
    },

    getTripCounts: function() {
      $('.popoverTemplate .exportOption li[data-value="selected"] span').text(this.collection.where({selected: true}).length);
      $('.popoverTemplate .exportOption li[data-value="tripList"] span').text(this.collection.length);
      $('.popoverTemplate .exportOption li[data-value="all"] span').text(tripCollection.length);
    },

    onRender: function() {
      //set sortType and enable sort
      this.setSort();
      this.enablePopovers();

      //toggle class if no trips
      $('body').toggleClass('noMatchingTrips', (this.collection.length === 0));

      var resize = this.resize;
      setTimeout(resize, 0);
    },

    resize: function() {
      var height = $(window).height() - $('header').outerHeight(true) - $('#filters').outerHeight(true);
      $('#trips ul.trips').height(height - $('.tripsHeader').outerHeight(true) - $('.tripsFooter').outerHeight(true) - 88);
    }

  });

});
