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
      'click .filterList li': 'addFilterFromMenu',
      'click .removeFilter': 'removeFilter',
      'click .resetFilters': 'resetFilters',
      'click .vehicleFilterValue li': 'changeVehicleFilter',
      'click .dateFilterValue li': 'changeDateFilter',
      'slideStop .durationFilterValue': 'changeDurationFilter',
      'slideStop .costFilterValue': 'changeCostFilter',
      'slideStop .timeFilterValue': 'changeTimeFilter',
      'slideStop .distanceFilterValue': 'changeDistanceFilter',
      'shown.bs.popover .btn-filter': 'initializePopoverContent',
      'click .filterNav .undo': 'undo',
      'click .filterNav .redo': 'redo',
      'changeDate .popover .dateFilterValueCustomStart': 'changeDateFilterCustom',
      'changeDate .popover .dateFilterValueCustomEnd': 'changeDateFilterCustom'
    },

    initialize: function() {
      console.log('Initialize a Filters CompositeView');

      var self = this;

      //update the filter ranges based on trips
      this.updateFilterRanges();
      coms.on('filter:updateDateFilter', _.bind(this.updateFilterRanges, this));

      coms.on('filter', _.bind(this.updateFilterRanges, this));

      //update Nav button status
      coms.on('filter:applyAllFilters', _.bind(this.updateNavButtons, this));

      //get a list of all vehicles and update filter
      vehiclesCollection.fetch().always(function(vehicles) {
        self.updateVehicleList();
      });


      //update filter text on buttons
      this.collection.each(this.updateFilterText);

      // initialize addFilter popover
      this.initializePopover();
    },

    model: new Filter(),
    collection: filtersCollection,
    childView: FilterView,
    attachHtml: function(collectionView, childView, index) {
      collectionView.$('ul.appliedFilters .addFilterContainer').before(childView.el);
    },

    template: FiltersTmpl,

    selectItem: function(item) {
      $(item)
        .addClass('selected')
        .siblings()
        .removeClass('selected');
    },

    updateNavButtons: function() {
      setTimeout(function() {
        $('.filterNav .redo').toggleClass('disabled', (Backbone.history.next.length === 0));
        $('.filterNav .undo').toggleClass('disabled', (Backbone.history.previous.length === 0));
      }, 0);
    },

    undo: function() {
      if(Backbone.history.previous.length) {
        Backbone.history.next.unshift(Backbone.history.fragment);
        var fragment = Backbone.history.previous.pop();
        Backbone.history.navigate(fragment, {trigger: true});
      }
    },

    redo: function() {
      if(Backbone.history.next.length) {
        Backbone.history.previous.push(Backbone.history.fragment);
        var fragment = Backbone.history.next.shift();
        Backbone.history.navigate(fragment, {trigger: true});
      }
    },

    initializePopover: function() {
      var self = this;

      setTimeout(function() {
        $('.addFilter').popover('destroy');
        $('.addFilter').popover({
          html: true,
          placement: 'bottom'
        });
        self.updateFilterList();
      }, 0);
    },

    addFilterFromMenu: function(e) {
      var filterName = $(e.target).data('filter');
      this.addFilter(filterName);
    },

    addFilter: function (filterName) {
      $('.addFilter').popover('hide');
      var filter = new Filter(filterList[filterName]);
      filter.set('showPopover', true);
      this.collection.saveFilters();
      this.collection.add(filter);
      this.updateFilterList();
    },

    removeFilter: function(e) {
      var name = $(e.target).data('filter'),
          filter = this.collection.findWhere({name: name});
      this.collection.remove(filter);
      this.updateFilterList();
    },

    resetFilters: function() {
      this.collection.reset();
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
      var valueSelected = $(e.target).data('value'),
          valueSelectedText = $(e.target).text(),
          filter = this.collection.findWhere({name: 'date'});

      if(valueSelected !== filter.get('valueSelected')) {
        var value = filter.get('getValue').call(filter, valueSelected);

        this.selectItem(e.target);

        $('.dateFilterCustom').toggle(valueSelected === 'custom');

        if(valueSelected === 'custom') {
          var startDate = moment(filter.get('trimDate').call(filter, value[0])).toDate(),
              endDate = moment(filter.get('trimDate').call(filter, value[1])).toDate();

          $('.popover .dateFilterValueCustomStart')
            .datepicker('setDate', startDate)
            .removeClass('changed');
          $('.popover .dateFilterValueCustomEnd')
            .datepicker('setDate', endDate)
            .removeClass('changed');
        }

        this.collection.saveFilters();
        filter.set({
          value: value,
          valueSelected: valueSelected,
          valueSelectedText: valueSelectedText
        });
        this.updateFilterText(filter);

        coms.trigger('filter:updateDateFilter');
        coms.trigger('filter:applyAllFilters');
      }
    },

    changeDateFilterCustom: function (e) {
      var filter = this.collection.findWhere({name: 'date'}),
          value = filter.get('value'),
          start = value[0],
          end = value[1],
          newStart = $('.popover .dateFilterValueCustomStart').datepicker('getDate').getTime(),
          newEnd = $('.popover .dateFilterValueCustomEnd').datepicker('getDate').getTime();

      $(e.target).addClass('changed');

      //check for actual change before triggering
      if(newStart && newEnd && (start !== newStart || end !== newEnd)) {
        this.collection.saveFilters();
        filter.set('value', [newStart, newEnd]);
        this.updateFilterText(filter);

        coms.trigger('filter:updateDateFilter');
        coms.trigger('filter:applyAllFilters');
      }
    },

    changeVehicleFilter: function (e) {
      var filter = this.collection.findWhere({name: 'vehicle'}),
          value = $(e.target).data('value');

      if(value !== filter.get('value')) {
        this.selectItem(e.target);
        this.collection.saveFilters();
        filter.set('value', value);
        this.updateFilterText(filter);
        coms.trigger('filter:applyAllFilters');
      }
    },

    changeDurationFilter: function (e) {
      var filter = this.collection.findWhere({name: 'duration'});
      this.collection.saveFilters();
      filter.set('value', $(e.target).slider('getValue'));
      this.updateFilterText(filter);
      coms.trigger('filter:applyAllFilters');
    },

    changeDistanceFilter: function (e) {
      console.log('Change Distance Filter')
      var filter = this.collection.findWhere({name: 'distance'});
      this.collection.saveFilters();
      filter.set('value', $(e.target).slider('getValue'));
      this.updateFilterText(filter);
      coms.trigger('filter:applyAllFilters');
    },

    changeCostFilter: function (e) {
      var filter = this.collection.findWhere({name: 'cost'});
      this.collection.saveFilters();
      filter.set('value', $(e.target).slider('getValue'));
      this.updateFilterText(filter);
      coms.trigger('filter:applyAllFilters');
    },

    changeTimeFilter: function (e) {
      var filter = this.collection.findWhere({name: 'time'});
      this.collection.saveFilters();
      filter.set('value', $(e.target).slider('getValue'));
      this.updateFilterText(filter);
      coms.trigger('filter:applyAllFilters');
    },

    updateVehicleList: function() {
      var self = this;
      setTimeout(function() {
        $('.vehicleFilterValue', self.$el).append(vehiclesCollection.map(function(vehicle) {
          return $('<li>')
            .attr('data-value', vehicle.get('id'))
            .text(vehicle.get('display_name'));
        }));
      }, 0);
    },

    initializePopoverContent: function(e) {
      var name = $(e.target).data('filter'),
          filter = this.collection.findWhere({name: name});

      if(name === 'distance' || name === 'duration' || name === 'cost' || name === 'time') {
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
      this.updateNavButtons();
    }
  });

});
