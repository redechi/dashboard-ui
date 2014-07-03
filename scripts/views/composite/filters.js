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
      'change .dateFilterValue': 'changeDateFilter',
      'slideStop .durationFilterValue': 'changeDurationFilter',
      'slideStop .costFilterValue': 'changeCostFilter',
      'slideStop .timeFilterValue': 'changeTimeFilter',
      'slideStop .distanceFilterValue': 'changeDistanceFilter',
      'change .vehicleFilterValue': 'changeVehicleFilter',
      'shown.bs.popover .btn-filter': 'initializeSliders',
      'click .filterNav .undo': 'browserBack',
      'click .filterNav .redo': 'browserForward'
    },

    initialize: function() {
      console.log('Initialize a Filters CompositeView');

      var self = this;

      //update the filter ranges based on trips
      this.updateFilterRanges();
      coms.on('filters:updateDateFilter', _.bind(this.updateFilterRanges, this));

      //get a list of all vehicles and update filter
      vehiclesCollection.fetch();
      this.updateVehicleList();

      //update filter text on buttons
      this.collection.each(this.updateFilterText);

      // initialize addFilter popover
      setTimeout(function() {
        $('.addFilter').popover({
          html: true,
          placement: 'bottom'
        });
        self.updateFilterList();
      }, 0);
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
      var remainingFilters = _.omit(filterList, this.collection.pluck('name'));
      
      $('.addFilterContainer').toggle(!_.isEmpty(remainingFilters));
      var content = $('<div>').append($('<ul>')
        .addClass('filterList')
        .append(_.map(remainingFilters, function(filter) {
          return $('<li>').attr('data-filter', filter.name).text(filter.title);
        }))).html();

      $('.addFilter').data('bs.popover').options.content = content;
    },

    updateFilterText: function(filter) {
      var name = filter.get('name');
      filter.get('updateValueText').call(filter);
      $('.btn-filter[data-filter="' + name + '"] .btn-text').text(filter.get('valueText'));
    },

    changeDateFilter: function (e) {
      var valueSelected = $(e.target).val(),
          valueSelectedText = $('option:selected', e.target).text(),
          filter = this.collection.findWhere({name: 'date'}),
          value = filter.get('getValue').call(filter, valueSelected);

      filter.set({
        value: value,
        valueSelected: valueSelected,
        valueSelectedText: valueSelectedText
      });
      this.updateFilterText(filter);

      coms.trigger('filters:updateDateFilter');
    },

    changeVehicleFilter: function (e) {
      var filter = this.collection.findWhere({name: 'vehicle'});
      filter.set('value', $(e.target).val());
      this.updateFilterText(filter);
    },

    changeDurationFilter: function (e) {
      var filter = this.collection.findWhere({name: 'duration'});
      filter.set('value', $(e.target).slider('getValue'));
      this.updateFilterText(filter);
    },

    changeDistanceFilter: function (e) {
      var filter = this.collection.findWhere({name: 'distance'});
      filter.set('value', $(e.target).slider('getValue'));
      this.updateFilterText(filter);
    },

    changeCostFilter: function (e) {
      var filter = this.collection.findWhere({name: 'cost'});
      filter.set('value', $(e.target).slider('getValue'));
      this.updateFilterText(filter);
    },

    changeTimeFilter: function (e) {
      var filter = this.collection.findWhere({name: 'time'});
      filter.set('value', $(e.target).slider('getValue'));
      this.updateFilterText(filter);
    },

    updateVehicleList: function() {
      var self = this;
      setTimeout(function() {
        self.$el.find('.vehicleFilterValue').append(vehiclesCollection.map(function(vehicle) {
          return '<option value="' + vehicle.get('id') + '">' + vehicle.get('display_name') + '</option>';
        }));
      }, 0);
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
