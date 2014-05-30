define([
  'backbone',
  'communicator',
  'views/item/filter',
  '../../collections/trips',
  '../../models/filter',
  'hbs!tmpl/composite/filters_tmpl'
],
function( Backbone, coms, FilterView, trips, Filter, FiltersTmpl  ) {
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

      // initialize popover
      setTimeout(function() {
        $('.addFilter').popover({
          html: true,
          placement: 'bottom'
        });
      }, 0);
    },

    model: new Filter(),
    collection: new Backbone.Collection([]),
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
      console.log($(e.target).data('filter'));
      this.collection.push(new Filter({
        name: 'blah',
        func: 'lt_distance_m',
        args: 2000
      }));

      this.closePopovers({});
    },

    closePopovers: function(e) {
      $('.btn-popover').not(e.currentTarget).popover('hide');
    },

    /* on render callback */
    onRender: function() {
    }
  });

});
