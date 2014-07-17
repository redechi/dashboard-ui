define([
  'backbone',
  '../composite/trips',
  '../item/user_score_view',
  'hbs!tmpl/layout/trip_list_layout_tmpl'
],
function( Backbone, TripsCompositeView, UserScoreView, TripListLayoutTmpl ) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    initialize: function() {
      console.log("initialize a TripListLayout Layout");
    },


    template: TripListLayoutTmpl,


    regions: {
      aggStats: "#aggStats",
      tripList: "#tripList"
    },


    onRender: function() {
      var userScoreView = new UserScoreView();
      var tripsCompView = new TripsCompositeView();

      this.aggStats.show(userScoreView);
      this.tripList.show(tripsCompView);
    }
  });
});
