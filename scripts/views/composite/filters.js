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
    },

    events: {
      'click .btn-popover': 'closePopovers',
      'click .filterList li': 'addFilter'
    },

    initialize: function() {
      console.log('Initialize a Filters CompositeView');
      var filterLi = this.makeFilterList();

      // initialize popover
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
      var c = this.data
      if (!this.collection.models[0]) {
        return this.data.reset(this.data.getLastFetch().toArray())
      }

      this.collection.each(_.bind(function (model) {
        model.applyTo(c);
      },this));

      coms.trigger('filter', c);
      return c;
    },

    addFilter: function (e) {
      var filter = $(e.target).data('filter');

      //sample filter data
      filterList[filter].max = 1;
      filterList[filter].vehicle_ids = ['529e5772e4b00a2ddb562f1f'];
      filterList[filter].latlng = [37.76537594388962, -122.4123740663029];
      filterList[filter].type = 'from'
      filterList[filter].dateRange = [1393729385431, 1401501801822];

      this.collection.push(new Filter(filterList[filter]));

      $('.addFilter')
        .popover('destroy')
        .popover({
          html: true,
          placement: 'bottom',
          content: this.makeFilterList()
        });

      this.closePopovers({});
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

    /* on render callback */
    onRender: function() {
    }
  });

});
