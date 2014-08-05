define([
  'backbone',
  'communicator',
  'regionManager',
  'collections/trips',
  'models/trip',
  '../item/single_trip',
  '../item/map',
  '../item/header',
  'hbs!tmpl/layout/trip_tmpl',
  './overlay',
  '../../controllers/login',
  '../../controllers/unit_formatters'
],
function( Backbone, coms, regionManager, tripsCollection, Trip, SingleTripView, MapView, HeaderView, TripTmpl, OverlayLayout, login, formatters ) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    initialize: function() {
      console.log('initialize a Trip Layout');

      var self = this;

      if(!tripsCollection.length) {
        //see if trips are in sessionStorage
        var trips = tripsCollection.fetchFromSessionStorage();

        if(trips) {
          tripsCollection.set(trips);
        }
      }

      if(tripsCollection.length) {
        this.model = tripsCollection.where({id: this.id}).pop();
      }

      if(this.model) {
        this.loaded = true;
      } else {
        //fetch single trip from server
        this.model = new Trip({id: this.id});

        this.model.fetch().always(function(data) {
          if(data.status === 404) {
            //Trip id invalid
            regionManager.getRegion('main_overlay').show(new OverlayLayout({type: 'invalidTrip'}));
          } else {
            self.updateTrip();
          }
        });
      }

      this.updateTripNavigation();
    },


    loaded: false,


    template: TripTmpl,


    regions: {
      map: '#map',
      trip: '#tripDetails'
    },


    updateTrip: function() {
      this.model.initialize();
      coms.trigger('overlay:hide');
      this.onShow();
    },


    updateTripNavigation: function() {
      var totalTripCount = tripsCollection.length,
          idx = tripsCollection.indexOf(this.model),
          next = tripsCollection.at(idx - 1),
          prev = tripsCollection.at(idx + 1);

      if(next) {
        var nextTrip = next.get('id');
      }

      if(prev) {
        var prevTrip = prev.get('id');
      }

      this.model.set({
        totalTripCount: totalTripCount,
        index: totalTripCount - idx,
        prevTrip: prevTrip,
        nextTrip: nextTrip
      });
    },


    onRender: function() {
      regionManager.getRegion('main_header').show(new HeaderView({attributes: {loggedIn: login.isLoggedIn}}));
      if(!this.loaded) {
        regionManager.getRegion('main_overlay').show(new OverlayLayout({type: 'loadingTrips'}));
      }
    },


    onShow: function() {
      var m = new MapView({collection: new Backbone.Collection(this.model), showTripEvents: this.showTripEvents});
      this.map.show(m);

      m.highlightAll();

      var s = new SingleTripView({model: this.model});
      this.trip.show(s);
    }
  });
});
