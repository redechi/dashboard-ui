define([
  'backbone',
  'communicator',
  '../composite/trips',
  '../item/user_score_view',
  'hbs!tmpl/layout/trip_list_layout_tmpl'
],
function( Backbone, coms, TripsCompositView, UserScoreView, TripListLayoutTmpl  ) {
    'use strict';

  /* Return a Layout class definition */
  return Backbone.Marionette.LayoutView.extend({

    initialize: function() {
      console.log("initialize a TripListLayout Layout");
    },

    template: TripListLayoutTmpl,

    /* Layout sub regions */
    regions: {
      aggStats: "#aggStats",
      tripList: "#tripList"
    },

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {},

    /* on render callback */
    onRender: function() {
      var userScoreView = new UserScoreView();
      var tripsCompView = new TripsCompositView();

      this.aggStats.show(userScoreView);
      this.tripList.show(tripsCompView);
    }
  });

});
