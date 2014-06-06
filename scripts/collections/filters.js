define([
  'backbone',
  'communicator',
  'models/filter',
  '../controllers/filter',
  '../collections/trips'
],
function( Backbone, coms, FilterModel, filterList, trips) {
  'use strict';

  /* filters singleton */
  var Filter = Backbone.AML.Collection.extend({

    model: Filter,

    initialize: function() {
      //Show date range filter by default
      this.add(new FilterModel(filterList.date));

      coms.on('filters:updateDateFilter', _.bind(this.updateFilterRanges, this));
    },

    updateFilterRanges: function() {
      var ranges = trips.calculateRanges(),
          distanceFilter = this.findWhere({name: 'distance'}),
          durationFilter = this.findWhere({name: 'duration'}),
          costFilter = this.findWhere({name: 'cost'});

      if(distanceFilter) {
        distanceFilter.set(ranges.distance);
      } else {
        _.extend(filterList.distance, ranges.distance);
      }

      if(durationFilter) {
        durationFilter.set(ranges.duration);
      } else {
        _.extend(filterList.duration, ranges.duration);
      }

      if(costFilter) {
        costFilter.set(ranges.cost);
      } else {
        _.extend(filterList.cost, ranges.cost);
      }
    }

  });

  // make this a singleton
  return new Filter();
});
