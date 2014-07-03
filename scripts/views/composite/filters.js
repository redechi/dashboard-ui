define([
  'underscore',
  'backbone',
  'communicator',
  'views/item/filter',
  '../../models/filter',
  '../../collections/filters',
  '../../collections/vehicles',
  '../../collections/trips',
  'hbs!tmpl/composite/filters_tmpl',
  '../../controllers/filter',
  '../../controllers/unit_formatters'
],
function(_, Backbone, coms, FilterView, Filter, filtersCollection, vehiclesCollection, tripsCollection, FiltersTmpl, filterList, formatters  ) {
  'use strict';

  /* Return a CompositeView class definition */
  return Backbone.Marionette.CompositeView.extend({

    events: {
      'click .btn-popover': 'closePopovers',
      'click .filterList li': 'addFilterFromMenu',
      'click .removeFilter': 'removeFilter',
      'click .resetFilters': 'resetFilters',
      'change .dateFilterValue': 'updateDateFilter',
      'slideStop .durationFilterValue': 'updateDurationFilter',
      'slideStop .costFilterValue': 'updateCostFilter',
      'slideStop .timeFilterValue': 'updateTimeFilter',
      'slideStop .distanceFilterValue': 'updateDistanceFilter',
      'shown.bs.popover .btn-filter': 'initializeSliders',
      'submit .locationFilterValue': 'updateLocationFilterForm',
      'change .locationFilterValueType': 'updateLocationFilterForm',
      'change .vehicleFilterValue': 'changeVehicleFilter',
      'click .filterNav .undo': 'browserBack',
      'click .filterNav .redo': 'browserForward'
    },

    initialize: function() {
      console.log('Initialize a Filters CompositeView');
      window.filter = this;

      var filterLi = this.makeFilterList();

      this.updateFilterRanges();
      coms.on('filters:updateDateFilter', _.bind(this.updateFilterRanges, this));

      // initialize addFilter popover
      setTimeout(function() {
        $('.addFilter').popover({
          html: true,
          placement: 'bottom',
          content: filterLi
        });
      }, 0);

      this.geocoder = L.mapbox.geocoder('automatic.i86oppa4');

      //get a list of all vehicles and update filter
      vehiclesCollection.fetch();
      this.updateVehicleList();
    },

    model: new Filter(),
    collection: filtersCollection,
    childView: FilterView,
    attachHtml: function(collectionView, childView, index) {
      collectionView.$('ul.appliedFilters .addFilterContainer').before(childView.el);
    },

    template: FiltersTmpl,

    browserBack: function () {
      window.history.back();
    },

    browserForward: function () {
      window.history.forward();
    },

    addFilterFromMenu: function(e) {
      var filterName = $(e.target).data('filter');
      this.addFilter(filterName);
    },

    addFilter: function (filterName) {
      $('.addFilter').popover('hide');
      var filter = new Filter(filterList[filterName]);
      filter.set('showPopover', true);
      this.collection.add(filter);
      this.updateFilterList();
    },

    removeFilter: function (e) {
      var name = $(e.target).data('filter'),
          filter = this.collection.findWhere({name: name});
      this.collection.remove(filter);
      this.updateFilterList();
    },

    resetFilters: function () {
      Backbone.history.navigate('/', {trigger: true});
    },

    updateFilterList: function() {
      $('.addFilter').data('bs.popover').options.content = this.makeFilterList();
    },

    updateDateFilter: function (e) {
      var valueSelected = $(e.target).val(),
          valueText = $('option:selected', e.target).text(),
          dateFilter = this.collection.findWhere({name: 'date'}),
          value = dateFilter.get('getValue').call(dateFilter, valueSelected);

      if(valueSelected === 'custom') {
        valueText = formatters.dateRange(value);
      }

      dateFilter.set({
        value: value,
        valueText: valueText,
        valueSelected: valueSelected
      });

      coms.trigger('filters:updateDateFilter');

      $('.btn-filter[data-filter="date"] .btn-text').text(valueText);
    },

    changeVehicleFilter: function (e) {
      var vehicleValue = $(e.target).val(),
          vehicleText = $('option:selected', e.target).text(),
          vehicleFilter = this.collection.findWhere({name: 'vehicle'});

      vehicleFilter.set('value', vehicleValue);
      vehicleFilter.set('valueText', vehicleText);
    },

    updateDurationFilter: function (e) {
      var durationValue = $(e.target).slider('getValue'),
          durationText = 'between ' + durationValue.join(' - ') + ' minutes',
          durationFilter = this.collection.findWhere({name: 'duration'});

      durationFilter.set('value', durationValue);
      $('.btn-filter[data-filter="duration"] .btn-text').text(durationText);
    },

    updateDistanceFilter: function (e) {
      var distanceValue = $(e.target).slider('getValue'),
          distanceText = 'between ' + distanceValue.join(' - ') + ' miles',
          distanceFilter = this.collection.findWhere({name: 'distance'});

      distanceFilter.set('value', distanceValue);
      $('.btn-filter[data-filter="distance"] .btn-text').text(distanceText);
    },

    updateCostFilter: function (e) {
      var costValue = $(e.target).slider('getValue'),
          costText = 'between ' + costValue.map(formatters.costWithUnit).join(' - '),
          costFilter = this.collection.findWhere({name: 'cost'});

      costFilter.set('value', costValue);
      $('.btn-filter[data-filter="cost"] .btn-text').text(costText);
    },

    updateTimeFilter: function (e) {
      var timeValue = $(e.target).slider('getValue'),
          timeText = 'between ' + timeValue.map(function(time) {
            return formatters.formatTime(moment(time, 'hours').valueOf(), null, 'h A');
          }).join(' - '),
          timeFilter = this.collection.findWhere({name: 'time'});

      timeFilter.set('value', timeValue);
      $('.btn-filter[data-filter="time"] .btn-text').text(timeText);
    },

    updateVehicleList: function() {
      var self = this;
      setTimeout(function() {
        self.$el.find('.vehicleFilterValue').append(vehiclesCollection.map(function(vehicle) {
          return '<option value="' + vehicle.get('id') + '">' + vehicle.get('display_name') + '</option>';
        }));
      }, 0);
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

    updateFilterRanges: function() {
      console.log('Updating Filter Ranges');

      var ranges = tripsCollection.calculateRanges(),
          distanceFilter = filtersCollection.findWhere({name: 'distance'}),
          durationFilter = filtersCollection.findWhere({name: 'duration'}),
          costFilter = filtersCollection.findWhere({name: 'cost'});

      if(distanceFilter) {
        distanceFilter.set(ranges.distance);
      } else {
        _.extend(filterList.distance, ranges.distance);
      }

      if(durationFilter) {
        durationFilter.set(ranges.duration);
      } else {
        _.extend(filterList.duration, ranges.duration);
      }

      if(costFilter) {
        costFilter.set(ranges.cost);
      } else {
        _.extend(filterList.cost, ranges.cost);
      }
    },

    onRender: function() {
    }
  });

});
