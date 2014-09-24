define([
  'backbone',
  'communicator',
  'regionManager',
  'views/item/trip',
  'hbs!tmpl/composite/trips_list_tmpl',
  'controllers/unit_formatters',
  'controllers/analytics',
  'collections/trips',
  'fileSaver',
  'jquery.scrollTo'
],
function( Backbone, coms, regionManager, Trip, tripListTmpl, formatters, analytics, tripsCollection, fileSaver ) {
  'use strict';

  return Backbone.Marionette.CompositeView.extend({

    model: new Backbone.Model({}),
    collection: new Backbone.Collection([]),
    childView: Trip,
    childViewContainer: '.trips ul',
    template: tripListTmpl,
    

    initialize: function() {
      coms.on('resize', _.bind(this.resize, this));
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
      coms.on('error:403', _.bind(this.setError, this));
      coms.on('error:500', _.bind(this.setError, this));

      this.options.sortType = 'start_time';
      this.options.sortDirection = 'sortDown';
      this.options.sortTypeName = 'Time/Date';
      this.options.fetching = true;
      this.selectors = {};

      setTimeout(function() {
        tripsCollection.fetchInitial();
      }, 200);
    },


    tripsHeight: 0,


    templateHelpers: function () {
      return {
        total: this.collection.length,
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


    setError: function() {
      this.options.error = true;
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
      analytics.trackEvent('select all', 'Click');
    },


    deselectAll: function() {
      var trips = this.collection.where({selected: true});
      coms.trigger('trips:toggleSelect', trips, {selected: false});
      analytics.trackEvent('deselect all', 'Click');
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


    activateItem: function(item) {
      $(item).addClass('active');
    },


    isSafari: function() {
      return navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
    },


    exportIsSupported: function() {
      //check for export support
      var exportSupported = false;
      try {
        exportSupported = !!new Blob;
      } catch (e) {}

      return exportSupported;
    },


    export: function (e) {
      var exportOption = $(e.target).data('value'),
          selectedTrips;

      if(!this.exportIsSupported()) {
        alert('Export is not supported in your browser. Please try again with IE10+, Chrome, Firefox or Safari.');
        return false;
      }

      this.activateItem(e.target);

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
        if(tripsCollection.startDate === 0) {
          //all trips are already downloaded
          this.downloadExport(tripsCollection);
        } else {
          //fetch all trips
          this.waitingForExport = true;
          tripsCollection.fetchAll();
        }
      }

      analytics.trackEvent('export', 'Download', exportOption);
    },


    notifyExport: function() {
      if(this.waitingForExport) {
        this.waitingForExport = false;
        this.downloadExport(tripsCollection);
      }
    },


    exportFilename: function() {
      return 'automatic-trips-' + moment().format('YYYY-MM-DD') + '.csv';
    },


    downloadExport: function(selectedTrips) {
      //Safari does not support filesaver, so use URL
      if(this.isSafari()) {
        var blobUrl = "data:application/x-download;charset=utf-8," + encodeURIComponent(this.tripsToCSV(selectedTrips));
        coms.trigger('trips:showDownloadExportOverlay', blobUrl);
      } else {
        var blob = new Blob([this.tripsToCSV(selectedTrips)], {type: "text/csv;charset=utf-8"});

        setTimeout(_.bind(function() {
          //fix for firefox on callback - needs a timeout
          saveAs(blob, this.exportFilename());
        }, this), 500);
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
        formatters.formatTime(t.start_time, t.start_time_zone, 'YYYY-MM-DD h:mm A'),
        t.end_location.name,
        formatters.formatTime(t.end_time, t.end_time_zone, 'YYYY-MM-DD h:mm A'),
        t.distance_miles.toFixed(2) || 0,
        t.duration.toFixed(2) || 0,
        t.formatted_fuel_cost_usd,
        t.average_mpg.toFixed(2) || 0,
        t.fuel_volume_gal.toFixed(2) || 0,
        t.hard_accels,
        t.hard_brakes,
        t.duration_over_70_s,
        t.duration_over_75_s,
        t.duration_over_80_s,
        t.start_location.lat,
        t.start_location.lon,
        t.start_location.accuracy_m,
        t.end_location.lat,
        t.end_location.lon,
        t.end_location.accuracy_m,
        t.path
      ];
    },


    csvFieldNames: function () {
      return [
        'Vehicle',
        'Start Location Name',
        'Start Time',
        'End Location Name',
        'End Time',
        'Distance (mi)',
        'Duration (min)',
        'Fuel Cost (USD)',
        'Average MPG',
        'Fuel Volume (gal)',
        'Hard Accelerations',
        'Hard Brakes',
        'Duration Over 70 mph (secs)',
        'Duration Over 75 mph (secs)',
        'Duration Over 80 mph (secs)',
        'Start Location Lat',
        'Start Location Lon',
        'Start Location Accuracy (meters)',
        'End Location Lat',
        'End Location Lon',
        'End Location Accuracy (meters)',
        'Path'
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

      analytics.trackEvent('sort direction', 'Change', this.options.sortDirection);
    },


    changeSortItem: function(e) {
      if(e) {
        this.options.sortType = $(e.target).data('value');
        this.options.sortTypeName = $(e.target).text();

        $('.sortType', this.$el).popover('hide');

        analytics.trackEvent('sort type', 'Change', this.options.sortTypeName);
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

      //close loading overlay unless no matching trips or error
      if((this.collection.length > 0 || this.options.fetching === false) && !this.options.error) {
        coms.trigger('overlay:hide');
      }

      //Set sort paramaters
      $('.sortValue li[data-value="' + this.options.sortType + '"]', this.$el).addClass('selected');

      $('.trips ul', this.$el).height(this.tripsHeight);
      this.options.fetching = false;
    },


    onShow: function() {
      _.defer(_.bind(function() {
        this.selectors = {
          window: $(window),
          tabletWarning: $('.tabletWarning:visible'),
          header: $('header'),
          filters: $('#filters')
        };

        this.resize();
      }, this));
    },


    resize: function() {
      var height = this.selectors.window.height() - this.selectors.tabletWarning.outerHeight(true) - this.selectors.header.outerHeight(true) - this.selectors.filters.outerHeight(true);
      this.tripsHeight = height - $('.tripsHeader', this.$el).outerHeight(true) - $('.tripsFooter', this.$el).outerHeight(true) - 90;
      $('.trips ul', this.$el).height(this.tripsHeight);
    }

  });

});
