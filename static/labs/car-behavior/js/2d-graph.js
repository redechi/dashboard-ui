(function() {

  // ----------
  var component = App.TwoDGraph = function(args) {
    this._sets = [];
    this.name = args.name;
    this._minX = args.minX;
    this._maxX = args.maxX;
    this._minY = args.minY;
    this.$container = args.$container;
    this._leftBuffer = 45;
    this._bottomBuffer = 35;
    this._rightBuffer = 0;
    this._xLabel = args.xLabel;
    this._yLabel = args.yLabel;
    this._yLabel2 = args.yLabel2;

    if (this._yLabel2) {
      this._rightBuffer = 45;
    }

    this._initSvg(args.$el);
    this.resize();
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
      this._svg = d3.select(this.$svg[0]);
    },

    // ----------
    resize: function() {
      this._width = this.$container.width();
      this._height = this._width * (9 / 16);

      this.$svg.css({
        height: this._height
      });
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

      if (this._minY !== undefined) {
        this._minValue = this._minY;
      }

      this._xScale = d3.scale.linear()
        .domain([this._minX, this._maxX])
        .range([this._leftBuffer, this._width - this._rightBuffer]);

      this._yScale = d3.scale.linear()
        .domain([this._minValue, this._maxValue])
        .range([this._height - this._bottomBuffer, 0]);
    },

    // ----------
    _renderSet: function(set) {
      var self = this;

      var line = d3.svg.line()
        .interpolate('basis')
        .x(function(d) { return self._xScale(d.x); })
        .y(function(d) { return self._yScale(d.value); });

      var path = this._svg.append("path")
        .attr('stroke', set.color)
        .attr('fill', 'none')
        .attr("d", line(set.data));

      if (set.dashed) {
        path.attr('stroke-dasharray', '5,5');
      }
    },

    // ----------
    render: function() {
      var self = this;

      // console.time('render');

      this._svg.selectAll('*').remove();

      var x, y;

      // lines
      y = this._yScale(0);
      this._svg.append('line')
        .attr('x1', this._leftBuffer)
        .attr('y1', y)
        .attr('x2', this._width - this._rightBuffer)
        .attr('y2', y)
        .attr('stroke-width', 1)
        .style('stroke', '#ddd');

      if (this._yLabel2) {
        x = this._xScale(this._maxX);
        this._svg.append('line')
          .attr('x1', x)
          .attr('y1', 0)
          .attr('x2', x)
          .attr('y2', this._height - this._bottomBuffer)
          .attr('stroke-width', 1)
          .style('stroke', '#eee');
      }

      // y axis
      x = 15;
      y = this._yScale((this._minValue + this._maxValue) / 2);
      this._svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90 ' + x + ',' + y + ')')
        .text(this._yLabel);

      var yAxis = d3.svg.axis()
        .scale(this._yScale)
        .orient('left')
        .ticks(5);

      this._svg.append('g')
          .attr('class', 'axis')
          .call(yAxis)
          .attr('transform','translate(' + this._leftBuffer + ',' + 0 + ')');

      // y axis 2
      if (this._yLabel2) {
        x = this._width - 5;
        y = this._yScale((this._minValue + this._maxValue) / 2);
        this._svg.append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .attr('transform', 'rotate(-90 ' + x + ',' + y + ')')
          .text(this._yLabel2);

        x -= 35;
        y = this._yScale(this._minValue);
        this._svg.append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'start')
          .text(Math.round(this._minValue));

        y = this._yScale(this._maxValue) + 15;
        this._svg.append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'start')
          .text(Math.round(this._maxValue));
      }

      // x axis
      x = this._xScale((this._minX + this._maxX) / 2);
      y = this._height - 1;
      this._svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .text(this._xLabel);

      var xAxis = d3.svg.axis()
        .scale(this._xScale)
        .orient('bottom')
        .ticks(10);

      this._svg.append('g')
          .attr('class', 'axis')
          .call(xAxis)
          .attr('transform','translate(' + 0 + ',' + (this._height - this._bottomBuffer) + ')');

      // sets
      _.each(this._sets, function(set) {
        self._renderSet(set);
      });

      // console.timeEnd('render');
    }
  };

})();
