define([
  './unit_formatters',
  'nvd3'
],
function( formatters ) {
  'use strict';

  return {
    scoreGraph: function(score, container, options) {

      //put nvd3 into production mode
      nv.dev = false;

      var scoreColor = formatters.scoreColor(score),
          trans = 100 - score;

      nv.addGraph(function() {
        var chart = nv.models.pieChart()
            .x(function(d) { return d.label; })
            .y(function(d) { return d.value; })
            .showLabels(false)    //Display pie labels
            .labelThreshold(0.05)  //Configure the minimum slice size for labels to show up
            .labelType('percent') //Configure what type of data to show in the label. Can be "key", "value" or "percent"
            .donut(true)          //Turn on Donut mode. Makes pie chart look tasty!
            .donutRatio(options.donut)      //Configure how big you want the donut hole size to be.
            .margin({top:0, right:0, bottom:0, left:0})
            .showLegend(false)
            .color([scoreColor, '#E3E2DE']);

        container.empty();

        var svg = d3.select(container.get(0));

        var datum = [
          {
            label: 'score',
            value: 0
          },
          {
            label: 'Transparency',
            value: 100
          }
        ];

        svg.attr('width', options.width)
           .attr('height', options.height);

        svg.datum(datum)
          .transition().duration(options.duration)
          .call(chart);

        // duplicate set for animation.
        datum = [
          {
            label: 'score',
            value: score
          },
          {
            label: 'Transparency',
            value: trans
          }
        ];

        svg.datum(datum)
          .transition().duration(options.duration)
          .call(chart);

        svg.append('text')
          .attr('x', (options.width / 2))
          .attr('y', (options.height * 0.65))
          .attr('text-anchor', 'middle')
          .attr('fill', scoreColor)
          .attr('class', 'averageScore')
          .text(parseInt(datum[0].value));

        // rotate the pie chart 180
        d3.select('.nv-pieChart').attr('transform', 'rotate(180,' + (options.width / 2) + ',' + (options.height / 2) + ')');

        return chart;
      });
    }
  };
});
