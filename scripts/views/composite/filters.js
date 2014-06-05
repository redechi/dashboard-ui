define([
  'underscore',
  'backbone',
  'communicator',
  'views/item/filter',
  '../../collections/trips',
  '../../collections/filters',
  '../../models/filter',
  'hbs!tmpl/composite/filters_tmpl',
  '../../controllers/filter',
  '../../controllers/unit_formatters'
],
function(_, Backbone, coms, FilterView, trips, filters, Filter, FiltersTmpl, filterList, formatters  ) {
  'use strict';

  /* Return a CompositeView class definition */
  return Backbone.Marionette.CompositeView.extend({

    collectionEvents: {
      'add': 'applyFilters',
      'remove': 'applyFilters',
      'change': 'applyFilters'
    },

    events: {
      'click .btn-popover': 'closePopovers',
      'click .filterList li': 'addFilter',
      'change .dateFilterValue': 'updateDateFilter',
      'slideStop .durationFilterValue': 'updateDurationFilter',
      'slideStop .distanceFilterValue': 'updateDistanceFilter',
      'slideStop .costFilterValue': 'updateCostFilter',
      'shown.bs.popover .btn-filter': 'initializeSliders',
      'click .updateLocationFilter': 'updateLocationFilterMap',
      'submit .locationFilterValue': 'updateLocationFilterForm',
      'change .locationFilterValueType': 'updateLocationFilterForm'
    },

    handleUpdate: function () {
      // TODO: update filter and trigger filter event.
    },

    initialize: function() {
      console.log('Initialize a Filters CompositeView');
      window.filter = this;

      var filterLi = this.makeFilterList();

      coms.on('all', this.handleUpdate);

      // initialize addFilter popover
      setTimeout(function() {
        $('.addFilter').popover({
          html: true,
          placement: 'bottom',
          content: filterLi
        });
      }, 0);

      this.geocoder = L.mapbox.geocoder('automatic.i86oppa4');
    },

    model: new Filter(),
    collection: filters,
    itemView: FilterView,
    itemViewContainer: 'ul',
    template: FiltersTmpl,

    data: trips,

    applyFilters: function () {
      var c = this.data.reset(this.data.getLastFetch().toArray());

      this.collection.each(_.bind(function (model) {
        model.applyTo(c);
      }, this));

      coms.trigger('filter', c);
      return c;
    },

    addFilter: function (e) {
      var filter = $(e.target).data('filter');

      //sample filter data
      // filterList[filter].max = 1;
      // filterList[filter].vehicle_ids = ['529e5772e4b00a2ddb562f1f'];
      // filterList[filter].latlng = [37.76537594388962, -122.4123740663029];
      // filterList[filter].type = 'from'
      //filterList[filter].dateRange = [1393729385431, 1401501801822];


      $('.addFilter').popover('hide');

      this.collection.add(new Filter(filterList[filter]));

      $('.addFilter').data('bs.popover').options.content = this.makeFilterList()

      //this.closePopovers({});
    },

    updateDateFilter: function (e) {
      var dateValue = $(e.target).val(),
          dateText = $('option:selected', e.target).text(),
          dateFilter = this.collection.findWhere({name: 'date'}),
          dateRange;

      dateFilter.set('value', dateValue);

      if(dateValue == 'all') {
        dateRange = [0, 8640000000000000];
      } else if(dateValue == 'today') {
        dateRange = [moment().startOf('day').valueOf(), moment().endOf("day").valueOf()];
      } else if(dateValue == 'thisWeek') {
        dateRange = [moment().startOf('week').valueOf(), moment().endOf("week").valueOf()];
      } else if(dateValue == 'thisMonth') {
        dateRange = [moment().startOf('month').valueOf(), moment().endOf("month").valueOf()];
      } else if(dateValue == 'lastMonth') {
        dateRange = [moment().subtract('months', 1).startOf('month').valueOf(), moment().subtract('months', 1).endOf('month').valueOf()];
      }

      dateFilter.set('dateRange', dateRange);
      $('.btn-filter[data-filter="date"] .btn-text').text(dateText);
    },

    updateVehicleFilter: function (e) {
      var vehicleValue = $(e.target).val(),
          vehicleText = $('option:selected', e.target).text(),
          vehilceFilter = this.collection.findWhere({name: 'vehicle'});

      vehicleFilter.set('value', vehicleValue);
      $('.btn-filter[data-filter="vehicle"] .btn-text').text(vehicleText);
    },

    updateDurationFilter: function (e) {
      var durationValue = $(e.target).slider('getValue'),
          durationText = durationValue.join(' - ') + ' minutes',
          durationFilter = this.collection.findWhere({name: 'duration'});

      durationFilter.set('value', durationValue);
      $('.btn-filter[data-filter="duration"] .btn-text').text(durationText);
    },

    updateDistanceFilter: function (e) {
      var distanceValue = $(e.target).slider('getValue'),
          distanceText = distanceValue.join(' - ') + ' miles',
          distanceFilter = this.collection.findWhere({name: 'distance'});

      distanceFilter.set('value', distanceValue);
      $('.btn-filter[data-filter="distance"] .btn-text').text(distanceText);
    },

    updateCostFilter: function (e) {
      var costValue = $(e.target).slider('getValue'),
          costText = costValue.map(formatters.cost).join(' - '),
          costFilter = this.collection.findWhere({name: 'cost'});

      costFilter.set('value', costValue);
      $('.btn-filter[data-filter="cost"] .btn-text').text(costText);
    },

    updateLocationFilterMap: function (e) {
      var locationType = $(e.target).data('type'),
          locationLatlng = [$(e.target).data('lat'), $(e.target).data('lng')],
          locationName = $(e.target).data('name'),
          locationText = ((locationType == 'start') ? 'Starts' : 'Ends') + ' at ' + locationName,
          locationFilter = this.collection.findWhere({name: 'location'});

      locationFilter.set('latlng', locationLatlng);
      locationFilter.set('type', locationType);
      $('.btn-filter[data-filter="location"] .btn-text').text(locationText);

      return false;
    },

    updateLocationFilterForm: function () {
      var locationFilter = this.collection.findWhere({name: 'location'}),
          locationName = $('.popover .locationFilterValueAddress').val(),
          locationType = $('.popover .locationFilterValueType').val();

      if(locationName === '') { return false; }

      this.geocoder.query(locationName, function(err, data) {
        if(err) {
          $('.popover .locationFilterResults').text('Address Not Found');
          return false;
        }
        $('.popover .locationFilterResults').empty();

        locationName = _.pluck(data.results[0], 'name').join(', ');
        var locationText = ((locationType == 'start') ? 'Starts' : 'Ends') + ' at ' + locationName;

        locationFilter.set({
          type: locationType,
          latlng: data.latlng,
          address: locationName
        });

        console.log(locationFilter)

        $('.btn-filter[data-filter="location"] .btn-text').text(locationText);
      });

      return false;
    },

    makeFilterList: function () {
      var remainingFilters = _.omit(filterList, this.collection.pluck('name'));
      return $('<div>').append($('<ul>')
        .addClass('filterList')
        .append(_.map(remainingFilters, function(filter) {
          return $('<li>').attr('data-filter', filter.name).text(filter.title);
        }))).html();
    },

    closePopovers: function(e) {
      $('.btn-popover').not(e.currentTarget).popover('hide');
    },

    initializeSliders: function(e) {
      var name = $(e.target).data('filter'),
          filter = this.collection.findWhere({name: name});

      if(name == 'distance' || name == 'duration' || name == 'cost' || name == 'time') {
        $('.popover .' + name + 'FilterValue').slider({
          min: 0,
          max: Math.ceil(filter.get('max')),
          formater: filter.get('formatter'),
          value: filter.get('value') || [0, filter.get('max')],
          tooltip_split: true
        });
      }
    },

    onRender: function() {
    }
  });

});
