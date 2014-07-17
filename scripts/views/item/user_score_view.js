define([
  'backbone',
  'communicator',
  '../../controllers/stats',
  '../../controllers/unit_formatters',
  'hbs!tmpl/item/user_score_tmpl'
],
function( Backbone, coms, stats, formatters, UserscoreTmpl ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("Initialize a Userscore ItemView");
      coms.on('filter', _.bind(this.resetCollection, this));
    },

    duration: 2000,

    model: new Backbone.Model({values:[],key:'No Data'}),

    collection: new Backbone.Collection([]),

    template: UserscoreTmpl,

    resetCollection: function (collection) {
      this.collection.reset(collection);
    },
    

    collectionEvents: {
      'reset': 'render'
    },


    templateHelpers: function() {
      var helpers =  {
        total: this.collection.length,
        distance: formatters.distance(stats.getSum(this.collection, 'distance_miles')),
        duration: formatters.duration(stats.getSum(this.collection, 'duration')),
        score: formatters.score(stats.getAverageScore(this.collection)),
        cost: formatters.costWithUnit(stats.getSum(this.collection, 'fuel_cost_usd')),
        mpg: formatters.averageMPG(stats.getAverageMPG(this.collection))
      };

      return helpers;
    },


    getAverageScore: function() {
      var weightedSum = this.collection.reduce(function(memo, trip) {
        memo.score += trip.get('score') * trip.get('duration');
        memo.time += trip.get('duration');
        return memo;
      }, {time: 0, score: 0});

      return weightedSum.score / weightedSum.time;
    },


    paintGraph: function() {
      var self = this;
      var score = self.$el.find('svg').data('score');
      var trans = 100 - score;

      nv.addGraph(function() {
        var chart = nv.models.pieChart()
            .x(function(d) { return d.label; })
            .y(function(d) { return d.value; })
            .showLabels(false)    //Display pie labels
            .labelThreshold(0.05)  //Configure the minimum slice size for labels to show up
            .labelType("percent") //Configure what type of data to show in the label. Can be "key", "value" or "percent"
            .donut(true)          //Turn on Donut mode. Makes pie chart look tasty!
            .donutRatio(0.9)      //Configure how big you want the donut hole size to be.
            .margin({top:0, right:0, bottom:0, left:0})
            .showLegend(false)
            .color([formatters.scoreColor(score), '#ddd']);

        self.$el.find('svg').empty();

        var svg = d3.select(self.$el.find('svg').get(0));

        var datum = [
          {
            "label": "score",
            "value" : 0
          } ,
          {
            "label": "Transparency",
            "value" : 100
          }
        ];

        svg.attr("width", 40)
           .attr("height", 40);

        svg.datum(datum)
          .transition().duration(self.duration || 2000)
          .call(chart);

        // duplicate set for animation.
        datum = [
          {
            "label": "score",
            "value" : score
          } ,
          {
            "label": "Transparency",
            "value" : trans
          }
        ];

        svg.datum(datum)
          .transition().duration(self.duration || 2000)
          .call(chart);

        svg.append('text')
          .attr("x", 20)
          .attr("y", 25)
          .attr("text-anchor", "middle")
          .attr('fill', formatters.scoreColor(score))
          .text(parseInt(datum[0].value));

        // rotate the chart 180
        d3.select(self.$el.find(".nv-pieChart").get(0))
          .attr('transform', 'rotate(180,20,20)');

          return chart;
      });
    },


    onRender: function () {
      this.paintGraph();
    }
  });

});
