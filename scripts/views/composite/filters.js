define([
  'backbone',
  'communicator',
  'moment',
  '../../controllers/login',
  'views/item/filter',
  '../../models/filter',
  '../../collections/filters',
  '../../collections/vehicles',
  '../../collections/trips',
  'hbs!tmpl/composite/filters_tmpl',
  '../../controllers/filter',
  '../../controllers/unit_formatters',
  '../../controllers/analytics'
],
function( Backbone, coms, moment, login, FilterView, Filter, filtersCollection, vehiclesCollection, tripsCollection, FiltersTmpl, filterList, formatters, analytics ) {
  'use strict';

  return Backbone.Marionette.CompositeView.extend({

    model: new Filter(),
    collection: filtersCollection,
    childView: FilterView,
    template: FiltersTmpl,


    initialize: function() {
      //update the filter ranges based on trips
      this.updateFilterRanges();
      coms.on('filter:updateDateFilter', this.updateFilterRanges, this);

      coms.on('filter', this.updateFilterRanges, this);
      coms.on('filter', this.checkIfClosePopovers, this);

      coms.on('filter:applyAllFilters', this.updateFilterControls, this);
      coms.on('filter:closePopovers', this.closePopovers, this);
      coms.on('filter:updateVehicleList', this.updateVehicleList, this);

      //handle unattached vehicles
      coms.on('filter:checkUnattachedVehicles', this.toggleUnattachedVehicles, this);

      //update filter text on buttons
      this.collection.each(_.bind(this.updateFilterText, this));

      // initialize addFilter popover
      this.initializePopover();
    },


    events: {
      'click .filterList li': 'addFilterFromMenu',
      'click .removeFilter': 'removeFilter',
      'click .reset': 'resetFilters',
      'click .vehicleFilterValue li': 'changeVehicleFilter',
      'click .dateFilterValue li': 'changeDateFilter',
      'slideStop .durationFilterValue': 'changeDurationFilter',
      'slide .durationFilterValue': 'updateDurationFilterLabel',
      'slideStop .costFilterValue': 'changeCostFilter',
      'slide .costFilterValue': 'updateCostFilterLabel',
      'slideStop .timeFilterValue': 'changeTimeFilter',
      'slide .timeFilterValue': 'updateTimeFilterLabel',
      'slideStop .distanceFilterValue': 'changeDistanceFilter',
      'slide .distanceFilterValue': 'updateDistanceFilterLabel',
      'show.bs.popover .btn-filter': 'preparePopoverContent',
      'shown.bs.popover .btn-filter': 'initializePopoverContent',
      'hide.bs.popover .btn-filter': 'hidePopoverContent',
      'click .filterControls .undo': 'undo',
      'dp.change .popover .dateFilterValueCustomStart': 'changeDateFilterCustom',
      'dp.change .popover .dateFilterValueCustomEnd': 'changeDateFilterCustom',
      'mouseleave .popover': 'mouseLeavePopover',
      'slideStart .popover input.slider': 'slideStart',
      'slideStop .popover input.slider': 'slideStop',
    },


    slideStart: function() {
      this.sliding = true;
    },


    slideStop: function() {
      this.sliding = false;
    },


    attachHtml: function(collectionView, childView) {
      collectionView.$('ul.appliedFilters .addFilterContainer').before(childView.el);
    },


    selectItem: function(item) {
      $(item)
        .addClass('selected')
        .siblings()
        .removeClass('selected');
    },


    activateItem: function(item) {
      $(item).addClass('active');
    },


    deactivateAll: function() {
      $('.listSelect.animate li', this.$el).removeClass('active');
    },


    updateFilterControls: function() {
      $('.filterControls .undo').toggleClass('disabled', (Backbone.history.previous.length === 0));
      $('.filterControls .reset').toggleClass('disabled', (Backbone.history.previous.length === 0));
    },


    undo: function() {
      if(Backbone.history.previous.length) {
        Backbone.history.next.unshift(Backbone.history.fragment);
        this.navigate(Backbone.history.previous.pop());
        analytics.trackEvent('undo filter', 'Click');
      }
    },


    navigate: function(fragment) {
      Backbone.history.navigate(fragment);
      filtersCollection.fromUrl();
      this.updateFilterList();
      this.collection.each(_.bind(this.updateFilterText, this));
      coms.trigger('filter:applyAllFilters');
    },


    initializePopover: function() {
      var self = this;

      _.defer(function(){
        $('.addFilter', self.$el)
          .popover('destroy')
          .popover({
            html: true,
            placement: 'bottom',
            viewport: 'body>main'
          });
        self.updateFilterList();
      });
    },


    checkIfClosePopovers: function(collection) {
      var dateFilter = this.collection.findWhere({name: 'date'});

      if(collection.length > 0 && dateFilter.get('valueSelected') !== 'custom') {
        $('.btn-popover[data-filter="date"], .btn-popover[data-filter="vehicle"]', this.$el).popover('hide');
      } else {
        this.deactivateAll();
      }
    },


    closePopovers: function() {
      $('.btn-popover', this.$el).popover('hide');
    },


    mouseLeavePopover: function(e) {
      var datetimepickerDivs = '.day, .month, .year, .prev, .next, .dow, .datepicker, .picker-switch, .datepicker-days, .datepicker-months, .datepicker-years, .bootstrap-datetimepicker-widget';

      //allow date selector mouseover and don't close if slider is sliding
      if(this.sliding || $(e.relatedTarget).is(datetimepickerDivs) || $(e.relatedTarget).parents('.datepicker').length !== 0) {
        return;
      } else {
        this.closePopovers();
      }
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
      analytics.trackEvent(filterName + ' filter', 'Add');
    },


    removeFilter: function(e) {
      var name = $(e.target).data('filter'),
          filter = this.collection.findWhere({name: name});

      this.collection.remove(filter);
      this.updateFilterList();
      coms.trigger('filter:applyAllFilters');
    },


    resetFilters: function() {
      $('.btn-filter.reset', this.$el).addClass('disabled');
      this.collection.reset();
      filtersCollection.applyInitialFilters();
      this.updateFilterList();
      Backbone.history.previous = [];
      coms.trigger('filter:applyAllFilters');
      analytics.trackEvent('reset filters', 'Click');
    },


    updateFilterList: function() {
      var remainingFilters = _.omit(filterList, this.collection.pluck('name'));

      $('.addFilterContainer').toggle(!_.isEmpty(remainingFilters));
      var content = $('<div>').append($('<ul>')
        .addClass('filterList')
        .append(_.map(remainingFilters, function(filter) {
          return $('<li>').attr('data-filter', filter.name).text(filter.title);
        }))).html();

      if($('.addFilter').data('bs.popover') && $('.addFilter').data('bs.popover').options) {
        $('.addFilter').data('bs.popover').options.content = content;
      }
    },


    updateFilterText: function(filter) {
      var name = filter.get('name');

      filter.get('updateValueText').call(filter);
      $('.btn-filter[data-filter="' + name + '"] .btn-text', this.$el).text(filter.get('valueText'));
    },


    changeDateFilter: function (e) {
      var valueSelected = $(e.target).data('value'),
          valueSelectedText = $(e.target).text(),
          filter = this.collection.findWhere({name: 'date'});

      if(valueSelected !== filter.get('valueSelected')) {
        var value = filter.get('getValue').call(filter, valueSelected);

        this.selectItem(e.target);

        this.activateItem(e.target);

        $('.dateFilterCustom').toggle(valueSelected === 'custom');

        this.collection.saveFilters();

        filter.set({
          value: value,
          valueSelected: valueSelected,
          valueSelectedText: valueSelectedText
        });

        if(valueSelected === 'custom') {
          this.setCustomDateFilter(filter);
        } else {
          this.updateFilterText(filter);

          coms.trigger('filter:updateDateFilter');
          coms.trigger('filter:applyAllFilters');
        }

        if(valueSelected === 'allTime') {
          analytics.trackEvent('show all trips', 'Click');
        }
      }
    },


    changeDateFilterCustom: function (e) {
      var filter = this.collection.findWhere({name: 'date'}),
          value = filter.get('value'),
          start = value[0],
          end = value[1],
          newStart = $('.popover .dateFilterValueCustomStart').data('DateTimePicker').getDate().valueOf(),
          newEnd = moment($('.popover .dateFilterValueCustomEnd').data('DateTimePicker').getDate()).endOf('day').valueOf();

      $('.popover .dateFilterValueCustomStart').data('DateTimePicker').hide();
      $('.popover .dateFilterValueCustomEnd').data('DateTimePicker').hide();

      //check for actual change before triggering
      if(newStart && newEnd && (start !== newStart || end !== newEnd)) {
        this.collection.saveFilters();
        filter.set('value', [newStart, newEnd]);
        this.updateFilterText(filter);

        coms.trigger('filter:updateDateFilter');
        coms.trigger('filter:applyAllFilters');

        analytics.trackEvent('custom date filter', 'Click');
      }
    },


    setCustomDateFilter: function(filter) {
      var value = filter.get('getValue').call(filter, 'custom'),
          startDate = moment(filter.get('trimDate').call(filter, value[0])).startOf('day').toDate(),
          endDate = moment(filter.get('trimDate').call(filter, value[1])).startOf('day').toDate();

      $('.popover .dateFilterValueCustomStart').data('DateTimePicker').setDate(startDate);
      $('.popover .dateFilterValueCustomEnd').data('DateTimePicker').setDate(endDate);

      this.deactivateAll();
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


    updateDurationFilterLabel: function (e) {
      var text = 'between ' + $(e.target).slider('getValue').join(' - ') + ' minutes';
      $('.btn-filter[data-filter="duration"] .btn-text', this.$el).text(text);
    },


    changeDistanceFilter: function (e) {
      var filter = this.collection.findWhere({name: 'distance'});
      this.collection.saveFilters();
      filter.set('value', $(e.target).slider('getValue'));
      this.updateFilterText(filter);
      coms.trigger('filter:applyAllFilters');
    },


    updateDistanceFilterLabel: function (e) {
      var text = 'between ' + $(e.target).slider('getValue').join(' - ') + ' miles';
      $('.btn-filter[data-filter="distance"] .btn-text', this.$el).text(text);
    },


    changeCostFilter: function (e) {
      var filter = this.collection.findWhere({name: 'cost'});
      this.collection.saveFilters();
      filter.set('value', $(e.target).slider('getValue'));
      this.updateFilterText(filter);
      coms.trigger('filter:applyAllFilters');
    },


    updateCostFilterLabel: function (e) {
      var text = 'between ' + $(e.target).slider('getValue').map(formatters.costWithUnit).join(' - ');
      $('.btn-filter[data-filter="cost"] .btn-text', this.$el).text(text);
    },


    changeTimeFilter: function (e) {
      var filter = this.collection.findWhere({name: 'time'});
      this.collection.saveFilters();
      filter.set('value', $(e.target).slider('getValue'));
      this.updateFilterText(filter);
      coms.trigger('filter:applyAllFilters');
    },


    updateTimeFilterLabel: function (e) {
      var text = 'between ' + $(e.target).slider('getValue').map(function(time) {
        return formatters.formatTime(moment(time, 'hours').valueOf(), null, 'h A');
      }).join(' - ');
      $('.btn-filter[data-filter="time"] .btn-text', this.$el).text(text);
    },


    updateVehicleList: function() {
      var self = this,
          filter = this.collection.findWhere({name: 'vehicle'});

      vehiclesCollection.each(function(vehicle) {
        $('<li>')
          .attr('data-value', vehicle.get('id'))
          .text(vehicle.get('display_name'))
          .append('<i>')
          .insertAfter($('.vehicleFilterValue li[data-value="all"]', self.$el));
      });
      this.updateFilterText(filter);
    },


    preparePopoverContent: function(e) {
      var name = $(e.target).data('filter'),
          filter = this.collection.findWhere({name: name});

      if(name === 'vehicle') {
        this.selectItem('.vehicleFilterValue li[data-value="' + filter.get('value') + '"]');
      } else if(name === 'date') {
        this.selectItem('.dateFilterValue li[data-value="' + filter.get('valueSelected') + '"]');
        $('.dateFilterCustom').toggle(filter.get('valueSelected') === 'custom');
      }
    },


    initializePopoverContent: function(e) {
      var name = $(e.target).data('filter'),
          filter = this.collection.findWhere({name: name});

      if(name === 'distance' || name === 'duration' || name === 'cost' || name === 'time') {
        $('.popover .' + name + 'FilterValue', this.$el).slider({
          min: 0,
          max: Math.ceil(filter.get('max')),
          formatter: filter.get('formatter'),
          value: filter.get('value') || [0, filter.get('max')],
          tooltip: 'hide'
        });
      } else if(name === 'date') {

        $('.popover .dateFilterCustom input').datetimepicker({
          minDate: new Date(2013, 2, 12),
          maxDate: moment().add(1, 'days').startOf('day').toDate(),
          pickTime: false
        });

        if(filter.get('valueSelected') === 'custom') {
          this.setCustomDateFilter(filter);
        }
      }
    },


    hidePopoverContent: function() {
      $('.popover .dateFilterCustom input').each(function() {
        if($(this).data('DateTimePicker')) {
          $(this).data('DateTimePicker').destroy();
        }
      });
    },


    updateFilterRanges: function() {
      var ranges = tripsCollection.calculateRanges(),
          distanceFilter = filtersCollection.findWhere({name: 'distance'}),
          durationFilter = filtersCollection.findWhere({name: 'duration'}),
          costFilter = filtersCollection.findWhere({name: 'cost'}),
          dateFilter = filtersCollection.findWhere({name: 'date'});

      if(distanceFilter) {
        distanceFilter.set(ranges.distance);
      }
      _.extend(filterList.distance, ranges.distance);

      if(durationFilter) {
        durationFilter.set(ranges.duration);
      }
      _.extend(filterList.duration, ranges.duration);

      if(costFilter) {
        costFilter.set(ranges.cost);
      }
      _.extend(filterList.cost, ranges.cost);

      if(dateFilter) {
        dateFilter.set(ranges.date);
      }
      _.extend(filterList.date, ranges.date);
    },


    hasUnattachedVehicles: function(trips) {
      return trips.some(function(trip) {
        return trip.get('vehicle') === undefined;
      });
    },


    toggleUnattachedVehicles: function(trips) {
      $('.vehicleFilterValue li[data-value="other"]', this.$el).toggleClass('hide', !this.hasUnattachedVehicles(trips));
    },


    onShow: function() {
      this.updateFilterControls();

      //get vehicles
      vehiclesCollection.fetchInitial();
    }
  });

});
