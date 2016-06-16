(function() {

  // ----------
  var component = App.TwoDGraph = function(args) {
    this._sets = [];
    this.name = args.name;
    this._minX = args.minX;
    this._maxX = args.maxX;
    this._initSvg(args.$el);
  };

  // ----------
  component.prototype = {
    // ----------
    addSets: function(sets) {
      this._sets = this._sets.concat(sets);
      this._updateData();
      this.render();
    },

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

      // note: we're grabbing the minX and maxX just for debugging purposes
      var minX = Infinity;
      var maxX = 0;
      var minValue = Infinity;
      var maxValue = 0;

      _.each(this._sets, function(set, setIndex) {
        set.data = _.filter(set.data, function(datum) {
          var isValidDatum = (!_.isNaN(datum.x) && !_.isNaN(datum.value) && _.isFinite(datum.x) && _.isFinite(datum.value));
          if (!isValidDatum) {
            console.warn('Bad data for ' + self.name + ', set ' + setIndex + ':', datum);
          }

          return isValidDatum;
        });

        _.each(set.data, function(datum) {
          minX = Math.min(minX, datum.x);
          maxX = Math.max(maxX, datum.x);
          minValue = Math.min(minValue, datum.value);
          maxValue = Math.max(maxValue, datum.value);
        });
      });

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
