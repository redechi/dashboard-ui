define([
  'underscore',
  'backbone',
  'communicator',
  'models/filter',
  'amlCollection',
  '../controllers/filter',
  '../collections/trips',
  '../collections/vehicles'
],
function( _, Backbone, coms, FilterModel, amlCollection, filterList, trips, vehicles) {
  'use strict';

  /* filters singleton */
  var Filter = Backbone.AML.Collection.extend({

    model: Filter,

    initialize: function() {
      //Show date range filter by default
      this.on('add', this.toUrl, this);
      this.on('add', function() {
        coms.trigger('filter:add');
      });
      this.on('remove', this.toUrl, this);
      window.filters = this;

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
    },


    getFiltersFromUrl: function () {
      var search = Backbone.history.fragment.replace('filter/?', ''),
          filterObj = search ? JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}',
                 function(key, value) {
                   return key === "" ? value : decodeURIComponent(value);
                 }) : {};

      return filterObj;
    },

    /*
     *
     * handles deduplication and hash generation.
     *
     */
    toUrl: function () {
      console.log('Write Filters to URL');
      var filterObj = _.object(this.map(function (filterModel) {
        return [filterModel.get('name'), filterModel.filterToString()];
      }));
      Backbone.history.navigate('/filter/?' + $.param(filterObj));
    },

    fromUrl: function (string) {
      console.log('Parsing Filters from URL');
      var filterObj = this.getFiltersFromUrl(),
          self = this;

      _.each(filterObj, function (value, name) {
        if (!filterList.hasOwnProperty(name)) {
          return;
        }

        var preExistingModel = self.findWhere({name: name});

        if(name !== 'vehicle') {
          value = value.split(',').map(function(item) {
            return parseFloat(item) || item;
          });
        }

        if (!!preExistingModel) {
          preExistingModel.set({value: value});
        } else {
          var filter = new FilterModel(filterList[name]);
          filter.set({value: value});

          if(name === 'vehicle' && value !== 'all') {
            var vehicle = vehicles.findWhere({id: value});
            console.log(vehicles)
            console.log(vehicle)
          }

          self.add(filter);
        }
      });

      // remove any extra models
      this.each(_.bind(function (filter) {
        var name = filter.get('name');
        if (!filterObj.hasOwnProperty(name)) {
          this.remove(filter);
        }
      }, this));

      // if no fewer than two models, clear and create a vehicle and date filter.
      if (_.size(filterObj) < 2) {
        this.reset();
        this.add(new FilterModel(filterList.vehicle));
        this.add(new FilterModel(filterList.date));
      }
    }



  });

  // make this a singleton
  return new Filter();
});
