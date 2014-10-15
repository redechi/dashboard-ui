define([
  'backbone',
  '../composite/trips',
  '../item/user_score_view',
  'hbs!tmpl/layout/trip_list_layout_tmpl'
],
function( Backbone, TripsView, UserScoreView, TripListLayoutTmpl ) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    template: TripListLayoutTmpl,


    regions: {
      tripStats: '#tripStats',
      tripList: '#tripList'
    },


    onRender: function() {
      var userScoreView = new UserScoreView();
      var tripsView = new TripsView();

      this.tripStats.show(userScoreView);
      this.tripList.show(tripsView);
    }
  });
});
