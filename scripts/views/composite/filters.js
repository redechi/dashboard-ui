define([
  'backbone',
  'communicator',
  'views/item/filter',
  '../../collections/trips',
  '../../collections/filters',
  '../../models/filter',
  'hbs!tmpl/composite/filters_tmpl',
  '../../controllers/filter'
],
function( Backbone, coms, FilterView, trips, filters, Filter, FiltersTmpl, filterList  ) {
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
      'shown.bs.popover .btn-filter': 'initializePopover'
    },

    handleUpdate: function () {
      // TODO: update filter and trigger filter event.
      console.log(arguments, this.model);
    },

    initialize: function() {
      console.log('Initialize a Filters CompositeView');
      var filterLi = this.makeFilterList();
      window.filter = this;

      coms.on('all', this.handleUpdate)

      // initialize addFilter popover
      setTimeout(function() {
        $('.addFilter').popover({
          html: true,
          placement: 'bottom',
          content: filterLi
        });
      }, 0);
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


      this.collection.add(new Filter(filterList[filter]));


      $('.addFilter')
        .popover('destroy')
        .popover({
          html: true,
          placement: 'bottom',
          content: this.makeFilterList()
        });

      //this.closePopovers({});
    },

    updateDateFilter: function (e) {
      var dateValue = $(e.target).val(),
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
    },

    updateDurationFilter: function (e) {
      var durationValue = $(e.target).slider('getValue'),
          durationFilter = this.collection.findWhere({name: 'duration'});

      durationFilter.set('value', durationValue);
    },

    updateDistanceFilter: function (e) {
      var distanceValue = $(e.target).slider('getValue'),
          distanceFilter = this.collection.findWhere({name: 'distance'});

      distanceFilter.set('value', distanceValue);
    },

    updateCostFilter: function (e) {
      var costValue = $(e.target).slider('getValue'),
          costFilter = this.collection.findWhere({name: 'cost'});

      costFilter.set('value', costValue);
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

    initializePopover: function(e) {
      var name = $(e.target).data('filter'),
          filter = this.collection.findWhere({name: name});

      if(name == 'distance' || name == 'duration' || name == 'cost') {
        $('.popover .' + name + 'FilterValue').slider({
          min: 0,
          max: Math.ceil(filter.get('max')),
          formater: filter.get('formatter'),
          value: filter.get('value') || [0, filter.get('max')],
          tooltip_split: true
        });
      }
    },

    /* on render callback */
    onRender: function() {
    }
  });

});
