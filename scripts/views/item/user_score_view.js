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

    model: new Backbone.Model({values:[],key:'No Data'}),
    collection: new Backbone.Collection([]),
    template: UserscoreTmpl,


    initialize: function() {
      coms.on('filter', _.bind(this.resetCollection, this));
    },
    

    duration: 1000,


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


    paintGraph: function() {
      var self = this,
          score = this.score,
          trans = 100 - score;

      nv.addGraph(function() {
        var chart = nv.models.pieChart()
            .x(function(d) { return d.label; })
            .y(function(d) { return d.value; })
            .showLabels(false)    //Display pie labels
            .labelThreshold(0.05)  //Configure the minimum slice size for labels to show up
            .labelType('percent') //Configure what type of data to show in the label. Can be "key", "value" or "percent"
            .donut(true)          //Turn on Donut mode. Makes pie chart look tasty!
            .donutRatio(0.85)      //Configure how big you want the donut hole size to be.
            .margin({top:0, right:0, bottom:0, left:0})
            .showLegend(false)
            .color([self.scoreColor, '#ddd']);

        self.$el.find('svg').empty();

        var svg = d3.select(self.$el.find('svg').get(0));

        var datum = [
          {
            'label': 'score',
            'value': 0
          } ,
          {
            'label': 'Transparency',
            'value': 100
          }
        ];

        svg.attr('width', 40)
           .attr('height', 40);

        svg.datum(datum)
          .transition().duration(self.duration)
          .call(chart);

        // duplicate set for animation.
        datum = [
          {
            'label': 'score',
            'value': score
          } ,
          {
            'label': 'Transparency',
            'value': trans
          }
        ];

        svg.datum(datum)
          .transition().duration(self.duration)
          .call(chart);

        svg.append('text')
          .attr('x', 20)
          .attr('y', 26)
          .attr('text-anchor', 'middle')
          .attr('fill', self.scoreColor)
          .attr('class', 'averageScore')
          .text(parseInt(datum[0].value));

        // rotate the chart 180
        d3.select(self.$el.find('.nv-pieChart').get(0))
          .attr('transform', 'rotate(180,20,20)');

        return chart;
      });
    },


    styleLine: function () {
      var rgb = this.scoreColor.replace(/[^\d,]/g, '');
      this.$el.find('.someTrips').css({
        'border-bottom': '1px solid ' + this.scoreColor,
        'box-shadow': 'inset 0px -2px 3px 0px rgba(' + rgb + ', 0.3)'
      });
    },


    onRender: function () {
      this.paintGraph();
      this.styleLine();
    }
  });

});
