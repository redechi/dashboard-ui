define([
  './unit_formatters',
  'nvd3'
],
function( formatters ) {
  'use strict';

  return {
    scoreGraph: function(score, container, options) {

      var scoreColor = formatters.scoreColor(score);
      var chart = nv.models.pieChart()
          .x(function(d) { return d.label; })
          .y(function(d) { return d.value; })
          .showLabels(false)
          .labelThreshold(0.05)
          .labelType('percent')
          .donut(true)
          .donutRatio(options.donut)
          .growOnHover(false)
          .margin({top:0, right:0, bottom:0, left:0})
          .showLegend(false)
          .startAngle(function(d) {
            return d.startAngle + Math.PI;
          })
          .endAngle(function(d) {
            return d.endAngle + Math.PI;
          })
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
          value: 100 - score
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

    }
  };
});
