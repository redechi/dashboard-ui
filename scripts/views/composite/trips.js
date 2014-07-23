define([
  'backbone',
  'communicator',
  'regionManager',
  'views/item/empty',
  'views/item/trip',
  'hbs!tmpl/composite/trips_list_tmpl',
  'controllers/unit_formatters',
  'collections/trips',
  'fileSaver'
],
function( Backbone, coms, regionManager, Empty, Trip, tripList, formatters, tripsCollection, fileSaver ) {
  'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.CompositeView.extend({

    initialize: function() {
      console.log("initialize a Trips CollectionView");

      coms.on('filter', _.bind(this.resetCollection, this));

      $(window).on("resize", this.resize);

      this.options.sortType = 'start_time';
      this.options.sortDirection = 'sortDown';
      tripsCollection.fetchAll();
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
      'click .sortValue li': 'changeSortItem',
      'click .sortDirection': 'changeSortDirection',
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
      var exportOption = $(e.target).data('value'),
          selectedTrips;

      if (exportOption === 'selected'){
        selectedTrips = this.collection.where({selected: true});
        if (!selectedTrips.length) {
          return alert('Please Select at least one trip');
        }
      } else if (exportOption === 'tripList'){
        selectedTrips = this.collection.models;
      } else if (exportOption === 'all') {
        selectedTrips = tripsCollection;
      }

      var blob = new Blob([this.tripsToCSV(selectedTrips)], {type: "text/csv;charset=utf-8"});
      saveAs(blob, "trips.csv");
      $('.export').popover('hide');
    },


    tripsToCSV: function(trips) {
      var self = this,
          tripsArray = trips.map(this.tripToArray);

      tripsArray.unshift(this.csvFieldNames());
      return this.toCSV(tripsArray);
    },


    tripToArray: function(trip) {
      var t = trip.toJSON();

      return [
        t.vehicle.year + ' ' + t.vehicle.make + ' ' + t.vehicle.model,
        t.start_location.name,
        t.start_location.lat,
        t.start_location.lon,
        t.start_location.accuracy_m,
        formatters.formatTime(t.start_time, t.start_time_zone, 'YYYY-MM-DD h:mm A'),
        t.end_location.name,
        t.end_location.lat,
        t.end_location.lon,
        t.end_location.accuracy_m,
        formatters.formatTime(t.end_time, t.end_time_zone, 'YYYY-MM-DD h:mm A'),
        t.path,
        t.distance_miles.toFixed(2) || 0,
        t.duration.toFixed(2) || 0,
        t.hard_accels,
        t.hard_brakes,
        t.duration_over_80_s,
        t.duration_over_75_s,
        t.duration_over_70_s,
        t.formatted_fuel_cost_usd,
        t.fuel_volume_gal.toFixed(2) || 0,
        t.average_mpg.toFixed(2) || 0
      ];
    },


    csvFieldNames: function () {
      return [
        'Vehicle',
        'Start Location Name',
        'Start Location Lat',
        'Start Location Lon',
        'Start Location Accuracy (meters)',
        'Start Time',
        'End Location Name',
        'End Location Lat',
        'End Location Lon',
        'End Location Accuracy (meters)',
        'End Time',
        'Path',
        'Distance (mi)',
        'Duration (min)',
        'Hard Accelerations',
        'Hard Brakes',
        'Duration Over 80 mph (secs)',
        'Duration Over 75 mph (secs)',
        'Duration Over 70 mph (secs)',
        'Fuel Cost (USD)',
        'Fuel Volume (gal)',
        'Average MPG'
      ];
    },


    toCSV: function (tripsArray) {
      var self = this;
      return tripsArray.map(function(row) {
        return row.map(self.csvEscape).join(',');
      }).join('\n');
    },


    csvEscape: function(item) {
      if (item && item.indexOf && (item.indexOf(',') !== -1 || item.indexOf('"') !== -1)) {
        item = '"' + item.replace(/"/g, '""') + '"';
      } else {
        item = '"' + item + '"';
      }
      return item;
    },


    changeSortDirection: function(e) {
      if($(e.currentTarget).data('direction') === 'sortDown') {
        this.options.sortDirection = 'sortUp';
      } else {
        this.options.sortDirection = 'sortDown';
      }

      $('.sortDirection')
        .data('direction', this.options.sortDirection)
        .toggleClass('sortUp', (this.options.sortDirection === 'sortUp'));

      this.doSort();
    },


    changeSortItem: function(e) {
      if(e) {
        this.options.sortType = $(e.currentTarget).data('value');
        this.options.sortTypeName = $(e.currentTarget).text();
      }
      $('.sortValue li').removeClass();
      $('.sortValue li[data-value="' + this.options.sortType + '"]').addClass('selected');

      $('.sortDirection')
        .data('direction', this.options.sortDirection)
        .toggleClass('sortUp', (this.options.sortDirection === 'sortUp'));

      $('.sortType').text(this.options.sortTypeName);

      this.doSort();
    },


    doSort: function() {
      var sortType = this.options.sortType,
          sortDirection = this.options.sortDirection;

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
      $('.popoverTemplate .exportOption li[data-value="selected"] span').text(this.collection.where({selected: true}).length)
      $('.popoverTemplate .exportOption li[data-value="selected"]').toggle(this.collection.where({selected: true}).length > 0);
      $('.popoverTemplate .exportOption li[data-value="tripList"] span').text(this.collection.length);
      $('.popoverTemplate .exportOption li[data-value="all"] span').text(tripsCollection.length);
    },


    onRender: function() {
      //enable sort
      this.changeSortItem();
      this.enablePopovers();

      //toggle class if no trips
      $('body').toggleClass('noMatchingTrips', (this.collection.length === 0));

      //close vehicle popover unless no matching trips
      if(this.collection.length > 0) {
        $('.btn-popover[data-filter="vehicle"]').popover('hide');
      }

      //close vehicle popover unless no matching trips or custom is chosen
      if(this.collection.length > 0 && $('.dateFilterValue li.selected').data('value') !== 'custom') {
        $('.btn-popover[data-filter="date"]').popover('hide');
      }

      if(tripsCollection.length > 0) {
        regionManager.getRegion('main_overlay').reset();
      }

      var resize = this.resize;
      setTimeout(resize, 0);
    },


    resize: function() {
      var height = $(window).height() - $('header').outerHeight(true) - $('#filters').outerHeight(true);
      $('#trips ul.trips').height(height - $('.tripsHeader').outerHeight(true) - $('.tripsFooter').outerHeight(true) - 88);
    }

  });

});
