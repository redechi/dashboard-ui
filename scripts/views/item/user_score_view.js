define([
  'backbone',
  'communicator',
  'hbs!tmpl/item/user_score_tmpl',
  '../../controllers/stats',
  '../../controllers/unit_formatters',
  '../../controllers/graph_helpers'
],
function( Backbone, coms, UserscoreTmpl, stats, formatters, graphHelpers ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    model: new Backbone.Model({values:[],key:'No Data'}),
    collection: new Backbone.Collection([]),
    template: UserscoreTmpl,


    initialize: function() {
      coms.on('filter', this.resetCollection, this);
    },


    resetCollection: function (collection) {
      this.collection.reset(collection);
    },


    collectionEvents: {
      'reset': 'render'
    },


    templateHelpers: function() {
      var helpers = {
        total: this.collection.length,
        distance: formatters.distance(stats.sumTrips(this.collection, 'distance_miles')),
        duration: formatters.durationHours(stats.sumTrips(this.collection, 'duration')),
        score: formatters.score(stats.sumTrips(this.collection, 'score')),
        cost: formatters.costWithUnit(stats.sumTrips(this.collection, 'fuel_cost_usd')),
        mpg: formatters.averageMPG(stats.sumTrips(this.collection, 'average_mpg'))
      };

      this.score = helpers.score;
      this.scoreColor = formatters.scoreColor(helpers.score);

      return helpers;
    },


    styleLine: function () {
      var rgb = this.scoreColor.replace(/[^\d,]/g, '');
      this.$el.find('.someTrips').css({
        'border-bottom': '1px solid ' + this.scoreColor,
        'box-shadow': 'inset 0px -2px 3px 0px rgba(' + rgb + ', 0.3)'
      });
    },


    onRender: function () {
      var options = {
        duration: 1000,
        width: 40,
        height: 40,
        donut: 0.85
      };
      if(this.score !== undefined) {
        graphHelpers.scoreGraph(this.score, $('svg', this.$el), options);
        this.styleLine();
      }
    }
  });

});
