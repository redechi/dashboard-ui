define([
  'backbone',
  'views/item/empty',
  'views/item/trip',
  '../../collections/trips',
  'hbs!tmpl/item/trips_list_tmpl'
],
function( Backbone, Empty, Trip, trips, tripList) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.CompositeView.extend({

    initialize: function() {
      this.render();
      this.collection.fetch();
      this.listenTo(this.collection, "reset", this.update);
      this.listenTo(this.collection, "sort", this.update);
      console.log("initialize a Trips CollectionView");
    },

    model: new Backbone.Model({}),
    collection: trips, 
    emptyView: Empty,
    itemView: Trip,
    itemViewContainer: "ul",
    template: tripList,

    /* ui selector cache */
    ui: {},

    export: function (e) {
      // TODO: implement exporting.
      var ids = this.collection.pluck("id");
      if (e.target.value === 'selected'){
        var selected = this.collection.where({selected: true});
        ids = new Backbone.Collection(selected).pluck("id")
      }

      if (!ids[0]) return alert('Please Select a Trip Or Five')
      window.location = '/download/trips.csv?trip_ids=' + ids.join(',');
    },

    templateHelpers: function() {
      return {total: this.collection.length};
    },

    /* Ui events hash */
    events: {
      'change #exporter': 'export'
    },

    /* on render callback */
    onRender: function() {}
  });

});

