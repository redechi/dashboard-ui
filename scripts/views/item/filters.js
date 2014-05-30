define([
  'backbone',
  'communicator',
  '../../collections/trips',
  'hbs!tmpl/item/filters_tmpl'
],
function( Backbone, coms, trips, FiltersTmpl  ) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a Filters ItemView");
      this.model.set('filters', []);
      window.filters = this;
    },

    addFilter: function (newFilter) {
      var f = this.model.get('filters').push(newFilter);
      this.model.set(f);
    },

    applyFilters: function (collection) {
      var c = collection || this.collection,
          f = this.model.get('filters'),
          out = c.clone();

      for (var i = 0, len = f.length; i < len; i++) {
        out = out.setFilter(f[i][0])
          .doFilter
          .apply(this.collection, f[i][1]);
      }

      console.log(out)
      return out;
    },

    collection: trips,

    model: new Backbone.Model({}),

    template: FiltersTmpl,

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {},

    /* on render callback */
    onRender: function() {}
  });

});
