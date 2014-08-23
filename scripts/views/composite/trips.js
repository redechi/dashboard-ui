define([
  'backbone',
  'communicator',
  'regionManager',
  'views/item/trip',
  'hbs!tmpl/composite/trips_list_tmpl',
  'controllers/unit_formatters',
  'collections/trips',
  'fileSaver'
],
function( Backbone, coms, regionManager, Trip, tripListTmpl, formatters, tripsCollection, fileSaver ) {
  'use strict';

  return Backbone.Marionette.CompositeView.extend({

    initialize: function() {
      coms.on('filter', _.bind(this.resetCollection, this));
      coms.on('filter:applyAllFilters', _.bind(this.notifyExport, this));
      coms.on('trips:toggleSelect', _.bind(this.toggleSelect, this));
      coms.on('trips:changeSelectedTrips', _.bind(this.changeSelectedTrips, this));
      coms.on('trips:showSingleTrip', _.bind(this.showSingleTrip, this));
      coms.on('trips:selectByDate', _.bind(this.selectByDate, this));
      coms.on('trips:highlightByDate', _.bind(this.highlightByDate, this));
      coms.on('trips:unhighlightByDate', _.bind(this.unhighlightByDate, this));
      coms.on('trips:highlight', _.bind(this.highlightTrips, this));
      coms.on('trips:unhighlight', _.bind(this.unhighlightTrips, this));

      $(window).on("resize", _.bind(this.resize, this));

      this.options.sortType = 'start_time';
      this.options.sortDirection = 'sortDown';
      this.options.sortTypeName = 'Time/Date';
      this.options.fetching = true;
      setTimeout(function() {
        tripsCollection.fetchInitial();
      }, 200);
    },

    tripsHeight: 0,

    model: new Backbone.Model({}),
    collection: new Backbone.Collection([]),
    childView: Trip,
    childViewContainer: ".trips ul",
    template: tripListTmpl,


    templateHelpers: function () {
      //check for export support
      var exportSupported = false;
      try {
        exportSupported = !!new Blob;
      } catch (e) {}

      return {
        total: this.collection.length,
        exportSupported: exportSupported,
        sortDirection: this.options.sortDirection,
        sortTypeName: this.options.sortTypeName
      };
    },


    events: {
      'click .exportOption li': 'export',
      'click .sortValue li': 'changeSortItem',
      'click .sortDirection': 'changeSortDirection',
      'show.bs.popover .export': 'getTripCounts',
      'click .selectAll': 'selectAll',
      'click .deselectAll': 'deselectAll'
    },


    collectionEvents: {
      'reset': 'render'
    },


    resetCollection: function (collection) {
      this.collection.reset(collection);
    },


    changeSelectedTrips: function() {
      var selectedTrips = this.collection.where({selected: true});
      $('.tripCount span')
        .text('(' + selectedTrips.length +  ' selected)')
        .toggle(selectedTrips.length > 0);
      $('.selectAll', this.$el).toggleClass('hide', !!selectedTrips.length);
      $('.deselectAll', this.$el).toggleClass('hide', !selectedTrips.length);
    },


    selectByDate: function(startDate, endDate, options) {
      var trips = this.collection.filter(function(trip) {
        return trip.get('start_time') >= startDate && trip.get('start_time') < endDate;
      });
      coms.trigger('trips:toggleSelect', trips, options);
    },


    highlightByDate: function(startDate, endDate) {
      var trips = this.collection.filter(function(trip) {
        return trip.get('start_time') >= startDate && trip.get('start_time') < endDate;
      });
      coms.trigger('trips:highlight', trips);
    },


    unhighlightByDate: function(startDate, endDate) {
      var trips = this.collection.filter(function(trip) {
        return trip.get('start_time') >= startDate && trip.get('start_time') < endDate;
      });
      coms.trigger('trips:unhighlight', trips);
    },


    selectAll: function() {
      coms.trigger('trips:toggleSelect', this.collection, {selected: true});
    },


    deselectAll: function() {
      var trips = this.collection.where({selected: true});
      coms.trigger('trips:toggleSelect', trips, {selected: false});
    },


    toggleSelect: function(trips, options) {
      var self = this,
          scrolling = false;
      options = options || {};

      trips.forEach(function(trip) {
        var div = $('.trips ul li[data-id="' + trip.get('id') + '"]', self.$el),
            selected;

        if(options.selected === undefined) {
          //toggle selected status
          selected = !trip.get('selected');
        } else {
          selected = options.selected;
        }

        trip.set('selected', selected);
        div.toggleClass('selected', selected);

        if(selected) {
          if(options.scroll && !scrolling) {
            scrolling = true;
            $('.trips', self.$el).scrollTo(div, {duration: 500, easing: 'swing', offset: (-(self.tripsHeight - 136) / 2)});
          }
          coms.trigger('trips:select', trip);
        } else {
          coms.trigger('trips:deselect', trip);
        }
      });

      coms.trigger('trips:changeSelectedTrips');
    },


    highlightTrips: function(trips) {
      var self = this;
      trips.forEach(function(trip) {
        $('.trips ul li[data-id="' + trip.get('id') + '"]', self.$el).addClass('highlighted');
      });
    },


    unhighlightTrips: function(trips) {
      var self = this;
      trips.forEach(function(trip) {
        $('.trips ul li[data-id="' + trip.get('id') + '"]', self.$el).removeClass('highlighted');
      });
    },


    export: function (e) {
      var exportOption = $(e.target).data('value'),
          selectedTrips;

      if (exportOption === 'selected'){
        selectedTrips = this.collection.where({selected: true});
        this.downloadExport(selectedTrips);
        if (!selectedTrips.length) {
          return alert('Please Select at least one trip');
        }
      } else if (exportOption === 'tripList'){
        selectedTrips = this.collection.models;
        this.downloadExport(selectedTrips);
      } else if (exportOption === 'all') {
        this.waitingForExport = true;
        tripsCollection.fetchAll();
      }
    },


    notifyExport: function() {
      if(this.waitingForExport) {
        this.waitingForExport = false;
        this.downloadExport(tripsCollection);
      }
    },


    downloadExport: function(selectedTrips) {
      //Safari does not support filesaver
      if(typeof safari !== "undefined") {
        window.location.href = "data:application/x-download;charset=utf-8," + encodeURIComponent(this.tripsToCSV(selectedTrips));
      } else {
        var blob = new Blob([this.tripsToCSV(selectedTrips)], {type: "text/csv;charset=utf-8"}),
            filename = 'automatic-trips-' + moment().format('YYYY-MM-DD') + '.csv';

        saveAs(blob, filename);
      }

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

      var vehicle = (t.vehicle) ? t.vehicle.year + ' ' + t.vehicle.make + ' ' + t.vehicle.model : '';

      return [
        vehicle,
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


    changeSortDirection: function() {
      this.options.sortDirection = (this.options.sortDirection === 'sortDown') ? 'sortUp' : 'sortDown';
      this.doSort();
    },


    changeSortItem: function(e) {
      if(e) {
        this.options.sortType = $(e.target).data('value');
        this.options.sortTypeName = $(e.target).text();

        $('.sortType', this.$el).popover('hide');
      }

      this.doSort();
    },


    doSort: function() {
      var sortType = this.options.sortType,
          sortDirection = (this.options.sortDirection === 'sortUp') ? 1 : -1;

      this.collection.comparator = function(trip) {
        return trip.get(sortType) * sortDirection;
      };

      this.collection.sort();
    },


    enablePopovers: function() {
      $('.export')
        .popover('destroy')
        .popover({
          html: true,
          content: function() { return $('.tripsFooter .popoverTemplate').html(); },
          title: 'Export Trips to .csv',
          placement: 'top',
          viewport: 'body>main'
        });

      $('.sortType')
        .popover('destroy')
        .popover({
          html: true,
          content: function() { return $('.tripsHeader .popoverTemplate').html(); },
          title: 'Sort By',
          placement: 'bottom',
          viewport: 'body>main'
        });
    },


    getTripCounts: function() {
      $('.popoverTemplate .exportOption li[data-value="selected"] span').text(this.collection.where({selected: true}).length)
      $('.popoverTemplate .exportOption li[data-value="selected"]').toggle(this.collection.where({selected: true}).length > 0);
      $('.popoverTemplate .exportOption li[data-value="tripList"] span').text(this.collection.length);
    },


    showSingleTrip: function (trip) {
      coms.trigger('trips:showSingleTripOverlay', trip, this.collection);
    },


    onRender: function() {
      this.enablePopovers();

      //toggle class if no trips
      $('body').toggleClass('noMatchingTrips', (this.collection.length === 0));

      //close loading overlay unless no matching trips
      if(this.collection.length > 0 || this.options.fetching === false) {
        coms.trigger('overlay:hide');
      }

      //Set sort paramaters
      $('.sortValue li[data-value="' + this.options.sortType + '"]', this.$el).addClass('selected');


      //close all open popovers, unless no matching trips
      // if(this.collection.length > 0) {
      //   coms.trigger('filter:closePopovers');
      // }

      $('.trips ul', this.$el).height(this.tripsHeight);
      this.options.fetching = false;
    },


    onShow: function() {
      _.defer(_.bind(this.resize, this));
    },


    resize: function() {
      var height = $(window).height() - $('header').outerHeight(true) - $('#filters').outerHeight(true);
      this.tripsHeight = height - $('.tripsHeader').outerHeight(true) - $('.tripsFooter').outerHeight(true) - 90;
      $('.trips ul', this.$el).height(this.tripsHeight);
    }

  });

});
