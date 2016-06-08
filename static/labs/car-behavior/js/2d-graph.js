(function() {

  // ----------
  var component = App.TwoDGraph = function() {
  };

  // ----------
  component.prototype = {
    // ----------
    _initSvg: function($svg) {
      this.$svg = $svg;
      this._width = this.$svg.width();
      this._height = this.$svg.height();
      this._svg = d3.select(this.$svg[0]);
    },

    // ----------
    _updateData: function() {
      var self = this;
      var minX = Infinity;
      var maxX = 0;
      var minValue = Infinity;
      var maxValue = 0;

      _.each(this._sets, function(set, setIndex) {
        _.each(set.data, function(datum) {
          if (_.isNaN(datum.x) || _.isNaN(datum.value)) {
            console.warn('NaN data for ' + self.name + ', set ' + setIndex + ':', datum);
            return;
          }

          minX = Math.min(minX, datum.x);
          maxX = Math.max(maxX, datum.x);
          minValue = Math.min(minValue, datum.value);
          maxValue = Math.max(maxValue, datum.value);
        });
      });

      this._minX = minX;
      this._maxX = maxX;
      this._minValue = minValue;
      this._maxValue = maxValue;

      this._xScale = d3.scale.linear()
        .domain([this._minX, this._maxX])
        .range([0, this._width]);

      this._yScale = d3.scale.linear()
        .domain([this._minValue, this._maxValue])
        .range([this._height, 0]);
    },

    // ----------
    _maxBucketValue: function(args) {
      var data = _.map(args.set.data, function(info) {
        info = _.clone(info);
        info.x = Math.floor(info.x / args.interval) * args.interval;
        return info;
      });

      data = _.groupBy(data, function(v, i) {
        return v.x;
      });

      data = _.map(data, function(infos, x) {
        var output = {
          x: parseFloat(x),
          infos: infos
        };

        var total = 0;
        var count = 0;
        _.each(infos, function(info) {
          total += info.total;
          count += info.count;
        });

        output.total = total;
        output.count = count;
        output.average = (count ? total / count : 0);

        if (args.updateAverage) {
          args.updateAverage(output);
        }

        return output;
      });

      var max = _.max(data, function(v) {
        return v.average;
      });

      return max.x;
    },

    // ----------
    _renderSet: function(set) {
      var self = this;

      var line = d3.svg.line()
        .interpolate('basis')
        .x(function(d) { return self._xScale(d.x); })
        .y(function(d) { return self._yScale(d.value); });

      this._svg.append("path")
        .attr('stroke', set.color)
        .attr('fill', 'none')
        .attr("d", line(set.data));
    },

    // ----------
    render: function() {
      var self = this;

      // console.time('render');

      this._svg.selectAll('*').remove();

      var y = this._yScale(0);
      this._svg.append('line')
        .attr('x1', 0)
        .attr('y1', y)
        .attr('x2', this._width)
        .attr('y2', y)
        .attr('stroke-width', 1)
        .style('stroke', '#ddd');

      _.each(this._sets, function(set) {
        self._renderSet(set);
      });

      // console.timeEnd('render');
    }
  };

})();
