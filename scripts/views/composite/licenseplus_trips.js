define([
  'backbone',
  'communicator',
  'moment',
  'views/item/licenseplus_trip',
  'hbs!tmpl/composite/licenseplus_trips_tmpl',
  'controllers/analytics',
  'collections/student_trips'
],
function( Backbone, coms, moment, LicenseplusTrip, licenseplusTripTmpl, analytics, studentTripsCollection ) {
  'use strict';

  return Backbone.Marionette.CompositeView.extend({

    initialize: function() {
      coms.on('error:403', this.setError, this);
      coms.on('error:500', this.setError, this);
      coms.on('resize', this.resize, this);
      coms.on('studentTrips:render', this.hideLoading, this);

      this.options.sortType = 'started_at';
      this.options.sortDirection = 'sortDown';
      this.options.sortTypeName = 'Time/Date';

      studentTripsCollection.student_id = this.attributes.student_id;

      studentTripsCollection.fetchInitial();
    },


    tripsHeight: 0,

    model: new Backbone.Model(),
    collection: studentTripsCollection,
    childView: LicenseplusTrip,
    childViewContainer: '.trips ul',
    template: licenseplusTripTmpl,


    templateHelpers: function () {
      return {
        total: this.collection.length,
        sortDirection: this.options.sortDirection,
        sortTypeName: this.options.sortTypeName
      };
    },


    events: {
      'click .sortValue li': 'changeSortItem',
      'click .sortDirection': 'changeSortDirection',
    },


    collectionEvents: {
      'sort': 'render',
      'add': 'render'
    },


    setError: function() {
      this.options.error = true;
    },


    changeSortDirection: function() {
      this.options.sortDirection = (this.options.sortDirection === 'sortDown') ? 'sortUp' : 'sortDown';
      this.doSort();

      analytics.trackEvent('sort direction student trips', 'Change', this.options.sortDirection);
    },


    changeSortItem: function(e) {
      if(e) {
        this.options.sortType = $(e.target).data('value');
        this.options.sortTypeName = $(e.target).text();

        $('.sortType', this.$el).popover('hide');

        analytics.trackEvent('sort type student trips', 'Change', this.options.sortTypeName);
      }

      this.doSort();
    },


    doSort: function() {
      var sortType = this.options.sortType,
          sortDirection = (this.options.sortDirection === 'sortUp') ? 1 : -1;

      this.collection.comparator = function(trip) {
        if(sortType === 'started_at') {
          return moment(trip.get('started_at')).valueOf() * sortDirection;
        } else {
          return trip.get(sortType) * sortDirection;
        }
      };

      this.collection.sort();
    },


    enablePopovers: function() {
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


    hideLoading: function() {
      $('.loading', this.$el).hide();
    },


    onRender: function() {
      _.defer(this.enablePopovers);

      // toggle loading
      $('.loading', this.$el).toggle(this.collection.length === 0);

      //Set sort paramaters
      $('.sortValue li[data-value="' + this.options.sortType + '"]', this.$el).addClass('selected');

      $('.trips ul', this.$el).height(this.tripsHeight);
    },


    resize: function() {
      this.tripsHeight = $('#studentTrips').outerHeight(true) - $('.tripsHeader', this.$el).outerHeight(true) - $('.sectionHeader', this.$el).outerHeight(true);
      $('.trips ul', this.$el).height(this.tripsHeight);
    }

  });

});
