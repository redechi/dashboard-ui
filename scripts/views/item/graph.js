define([
  'backbone',
  'hbs!tmpl/item/graph_tmpl',
  '../../collections/trips'
],
function( Backbone, GraphTmpl, trips) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a Graph ItemView");
      this.listenTo(this.collection, "sync", this.syncModel);
      this.model.on('change', this.render);
    },

    syncModel: function () {
      var collection = this.collection;
      var changed = {
        distance: parseInt(100 * collection.setAgg('distance').aggregate()) / 100,
        someOtherAgg: 0
      }
      this.model.set(changed);
    },

    model: new Backbone.Model({}),

    collection: trips, // trips singleton

    template: GraphTmpl,

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {},

    /* on render callback */
    onRender: function() {}
  });

});
