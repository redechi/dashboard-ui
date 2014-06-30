define([
  'backbone',
  'communicator',
  'amlCollection',
  '../../collections/trips',
  '../../controllers/unit_formatters',
  'hbs!tmpl/item/user_score_tmpl'
],
function( Backbone, coms, AMLCollection, tripsCollection, formatters, UserscoreTmpl  ) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a Userscore ItemView");
      this.collection.graphType = 'average_mpg';
      coms.on('filter', _.bind(this.resetCollection, this));
      this.resetCollection(tripsCollection);
      this.on('render', this.paintGraph, this);
      tripsCollection.on('sync', this.render, this);
    },

    duration: 2000,
    model: new Backbone.Model({values:[],key:'No Data'}),
    collection: new AMLCollection([]),
    template: UserscoreTmpl,

    resetCollection: function (newCollection) {
      this.collection.reset(newCollection.toArray());
    },

    templateHelpers: function() {
      var helpers =  {
        total: this.collection.length,
        distance: formatters.distance(this.collection.reduce(function(memo, trip) { return memo + trip.get('distance_miles'); }, 0)),
        duration: formatters.duration(this.collection.reduce(function(memo, trip) { return memo + trip.get('duration'); }, 0)),
        score: formatters.score(tripsCollection.getAverageScore()),
        cost: formatters.cost(this.collection.reduce(function(memo, trip) { return memo + trip.get('fuel_cost_usd'); }, 0))
      };

      helpers.mpg = formatters.averageMPG(helpers.distance / this.collection.reduce(function(memo, trip) { return memo + trip.get('fuel_volume_gal'); }, 0));

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
            .x(function(d) { return d.label })
            .y(function(d) { return d.value })
            .showLabels(false)    //Display pie labels
            .labelThreshold(.05)  //Configure the minimum slice size for labels to show up
            .labelType("percent") //Configure what type of data to show in the label. Can be "key", "value" or "percent"
            .donut(true)          //Turn on Donut mode. Makes pie chart look tasty!
            .donutRatio(0.9)      //Configure how big you want the donut hole size to be.
            .margin({top:0, right:0, bottom:0, left:0})
            .showLegend(false)
            .color([formatters.scoreColor(score), '#ddd']);

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
        var datum = [
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

    onRender: function () {}
  });

});
