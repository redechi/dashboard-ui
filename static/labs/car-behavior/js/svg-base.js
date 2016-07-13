(function() {

  // ----------
  var component = App.SvgBase = function() {
  };

  // ----------
  component.prototype = {
    // ----------
    _init: function(args) {
      var self = this;

      this.$container = args.$container;
      this.$svg = args.$svg;
      this._svg = d3.select(this.$svg[0]);
      this._leftBuffer = 45;
      this._rightBuffer = 0;
      this._topBuffer = 0;
      this._bottomBuffer = 32;

      this.updateSize();

      this._debouncedRender = _.debounce(function() {
        self.render();
      }, 100);
    },

    // ----------
    // Overridden by subclasses
    updateSize: function() {
    },

    // ----------
    resize: function() {
      var oldWidth = this._width;
      var oldHeight = this._height;

      this.updateSize();

      if (this._width !== oldWidth || this._height !== oldHeight) {
        this._debouncedRender();
      }
    },

    // ----------
    drawFrame: function(args) {
      var x, y;
      var top = this._topBuffer;
      var bottom = this._height - this._bottomBuffer;

      // y axis
      x = 15;
      y = (top + bottom) / 2;
      this._svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90 ' + x + ',' + y + ')')
        .text(args.yLabel);

      if (args.maxYLabel) {
        y = top;
        this._svg.append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'end')
          .attr('transform', 'rotate(-90 ' + x + ',' + y + ')')
          .text(args.maxYLabel);
      }

      if (args.minYLabel) {
        y = bottom;
        this._svg.append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'start')
          .attr('transform', 'rotate(-90 ' + x + ',' + y + ')')
          .text(args.minYLabel);
      }

      var yAxis = d3.svg.axis()
        .scale(args.yScale)
        .orient('left')
        .ticks(5);

      this._svg.append('g')
          .attr('class', 'axis')
          .call(yAxis)
          .attr('transform','translate(' + this._leftBuffer + ',' + 0 + ')');

      // x axis
      x = this._leftBuffer + ((this._width - (this._leftBuffer + this._rightBuffer)) / 2);
      y = this._height - 1;
      this._svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .text(args.xLabel);

      var xAxis = d3.svg.axis()
        .scale(args.xScale)
        .orient('bottom')
        .ticks(10);

      this._svg.append('g')
          .attr('class', 'axis horizontal')
          .call(xAxis)
          .attr('transform','translate(' + 0 + ',' + bottom + ')');
    }
  };

})();
