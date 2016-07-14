(function() {

  var superClass = App.SvgBase.prototype;

  // ----------
  var component = App.Heatmap = function(args) {
    this._mode = args.mode;
    this._data = args.data;
    this._valueKey = this._data.valueKey(this._mode);
    this._xLabel = args.xLabel;
    this._yLabel = args.yLabel;
    this._xLabelFactor = args.xLabelFactor || 1;
    this._yLabelFactor = args.yLabelFactor || 1;
    this._maxYLabel = args.maxYLabel;
    this._minYLabel = args.minYLabel;
    this._minY = args.minY;
    this._heatLabel = args.heatLabel;
    this._minHeatLabel = args.minHeatLabel;
    this._maxHeatLabel = args.maxHeatLabel;

    superClass._init.call(this, {
      $svg: args.$el,
      $container: args.$container
    });

    this._leftBuffer = 50;
    this._rightBuffer = 45;
    this._topBuffer = 5;
    this._smoothData();
    this.render();
  };

  // ----------
  component.prototype = _.extend({}, superClass, {
    // ----------
    // Overrides superclass method
    updateSize: function() {
      // See .right-heatmap, .right-insight, .right-controls, and .comparison .table in car-behavior.css
      // for styles related to this gutter value
      var gutter = 36;

      this._width = (this.$container.width() / 2) - (gutter / 2);
      this._height = this._width * (3 / 4);

      var css = {
        width: this._width,
        height: this._height
      };

      this.$svg.css(css);
    },

    // ----------
    render: function() {
      var self = this;

      // console.time('render');

      var left = this._leftBuffer;
      var right = this._width - this._rightBuffer;
      var width = right - left;
      var top = this._topBuffer;
      var bottom = this._height - this._bottomBuffer;
      var height = bottom - top;
      var tileExtra = 0.5; // A little overlap so we don't see seams

      var minY = (this._minY === undefined ? this._data.minY : this._minY);

      var xExtent = (this._data.maxX - this._data.minX) + 1;
      var xFactor = this._width / xExtent;
      var columnWidth = width / (xExtent / this._data.xInterval);

      var yExtent = (this._data.maxY - minY) + 1;
      var yFactor = this._width / yExtent;
      var rowHeight = height / (yExtent / this._data.yInterval);

      var xScale = d3.scale.linear()
        .domain([this._data.minX, this._data.maxX])
        .range([this._leftBuffer, this._width - (this._rightBuffer + columnWidth)]);

      var xAxisMax = Math.round(this._data.maxX * this._xLabelFactor);
      if (xAxisMax === 99) {
        xAxisMax = 100; // Special case for kilometer to mile conversion so the last tick label appears
      }

      var axisXScale = d3.scale.linear()
        .domain([this._data.minX * this._xLabelFactor, xAxisMax])
        .range([this._leftBuffer, this._width - this._rightBuffer]);

      var yScale = d3.scale.linear()
        .domain([minY, this._data.maxY])
        .range([this._height - (this._bottomBuffer + rowHeight), this._topBuffer]);

      var yAxisMax = Math.round(this._data.maxY * this._yLabelFactor);
      if (yAxisMax === 99) {
        yAxisMax = 100; // Special case for kilometer to mile conversion so the last tick label appears
      }

      var axisYScale = d3.scale.linear()
        .domain([minY * this._yLabelFactor, yAxisMax])
        .range([this._height - this._bottomBuffer, this._topBuffer]);

      var colorScale = d3.scale.linear()
        .domain([0, 0.1, 1])
        .range([
          '#fff',
          '#dbf5fd',
          '#1a1c41'
        ])
        .clamp(true);

      this._svg.selectAll('*').remove();

      var gradient = this._svg.append('linearGradient')
        .attr('id', 'legend-gradient')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0)
        .attr('y1', yScale(minY))
        .attr('x2', 0)
        .attr('y2', yScale(this._data.maxY));

      gradient.append('stop')
        .attr('stop-color', colorScale(0))
        .attr('offset', '0%');

      gradient.append('stop')
        .attr('stop-color', colorScale(0.1))
        .attr('offset', '10%');

      gradient.append('stop')
        .attr('stop-color', colorScale(1))
        .attr('offset', '100%');

      var maxValue = 0;
      _.each(this._smoothedGrid, function(info, key) {
        maxValue = Math.max(maxValue, info[self._valueKey]);
      });

      _.each(this._smoothedGrid, function(info, key) {
        var value = info[self._valueKey];
        if (!value || info.y < minY) {
          return;
        }

        var x = xScale(info.x);
        var y = yScale(info.y);
        self._svg.append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', columnWidth + tileExtra)
          .attr('height', rowHeight + tileExtra)
          .attr('fill', colorScale(value / maxValue));
      });

      this.drawFrame({
        xLabel: this._xLabel,
        yLabel: this._yLabel,
        minYLabel: this._minYLabel,
        maxYLabel: this._maxYLabel,
        xScale: axisXScale,
        yScale: axisYScale
      });

      this._svg.append('rect')
        .attr('x', this._leftBuffer)
        .attr('y', this._topBuffer)
        .attr('width', width)
        .attr('height', height)
        .attr('stroke', '#ddd')
        .attr('fill', 'none');

      var x = this._width - this._rightBuffer;

      this._svg.append('rect')
        .attr('x', x + 35)
        .attr('y', this._topBuffer)
        .attr('width', 10)
        .attr('height', height)
        .attr('fill', 'url(#legend-gradient)');

      x += 20;
      var y = (this._height - this._bottomBuffer) / 2;
      this._svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90 ' + x + ',' + y + ')')
        .text(this._heatLabel);

      if (this._minHeatLabel && this._maxHeatLabel) {
        y = this._topBuffer;
        this._svg.append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'end')
          .attr('transform', 'rotate(-90 ' + x + ',' + y + ')')
          .text(this._maxHeatLabel);

        y = this._height - this._bottomBuffer;
        this._svg.append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'start')
          .attr('transform', 'rotate(-90 ' + x + ',' + y + ')')
          .text(this._minHeatLabel);
      } else {
        var maxValueLabel = maxValue;
        if (maxValueLabel < 1) {
          maxValueLabel = Math.round(maxValueLabel * 100) / 100;
        } else {
          maxValueLabel = Math.round(maxValueLabel);
        }

        x += 10;
        y = this._topBuffer + 15;
        this._svg.append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'end')
          .attr('fill', '#888')
          .text(maxValueLabel);

        y = this._height - this._bottomBuffer;
        this._svg.append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'end')
          .attr('fill', '#888')
          .text(0);
      }

      // console.timeEnd('render');
    },

    // ----------
    _smoothData: function() {
      var self = this;

      // console.time('smooth');

      var kernel = [
        {
          x: -1,
          y: -1,
          weight: 0.2
        },
        {
          x: 0,
          y: -1,
          weight: 0.33
        },
        {
          x: 1,
          y: -1,
          weight: 0.2
        },
        {
          x: -1,
          y: 0,
          weight: 0.33
        },
        {
          x: 0,
          y: 0,
          weight: 1
        },
        {
          x: 1,
          y: 0,
          weight: 0.33
        },
        {
          x: -1,
          y: 1,
          weight: 0.2
        },
        {
          x: 0,
          y: 1,
          weight: 0.33
        },
        {
          x: 1,
          y: 1,
          weight: 0.2
        },
      ];

      var oldGrid = this._data.grid;
      var newGrid = {};
      var minY = (this._minY === undefined ? this._data.minY : this._minY);

      var smooth = function(x, y) {
        var key = self._data.key(x, y);
        var oldInfo = oldGrid[key];
        var newInfo = _.clone(oldInfo);
        newGrid[key] = newInfo;

        var total = 0;
        var weight = 0;

        _.each(kernel, function(k) {
          var neighborX = x + (k.x * self._data.xInterval);
          var neighborY = y + (k.y * self._data.yInterval);
          if (neighborY < minY) {
            return;
          }

          var neighborKey = self._data.key(neighborX, neighborY);
          var neighborInfo = oldGrid[neighborKey];
          if (neighborInfo) {
            total += neighborInfo[self._valueKey] * k.weight;
            weight += k.weight;
          }
        });

        newInfo[self._valueKey] = (weight ? total / weight : 0);
      };

      var x, y;
      for (y = minY; y <= this._data.maxY; y += this._data.yInterval) {
        for (x = this._data.minX; x <= this._data.maxX; x += this._data.xInterval) {
          smooth(x, y);
        }
      }

      this._smoothedGrid = newGrid;

      // console.timeEnd('smooth');
    }
  });

})();
