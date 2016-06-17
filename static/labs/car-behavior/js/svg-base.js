(function() {

  // ----------
  var component = App.SvgBase = function() {
  };

  // ----------
  component.prototype = {
    // ----------
    _init: function(args) {
      this.$container = args.$container;
      this.$svg = args.$svg;
      this._svg = d3.select(this.$svg[0]);
      this._leftBuffer = 45;
      this._bottomBuffer = 32;

      this.resize();
    },

    // ----------
    resize: function() {
      // see the .heatmap-svg:first-child margin-right in car-behavior.css
      // though we've had to fudge it a little
      var gutter = 15;

      this._width = (this.$container.width() / 2) - (gutter / 2);
      this._height = this._width * (3 / 4);

      this.$svg.css({
        width: this._width,
        height: this._height
      });
    },

    // ----------
    drawFrame: function(args) {
      var x = 15;
      var y = (this._height - this._bottomBuffer) / 2;
      this._svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90 ' + x + ',' + y + ')')
        .text(args.yLabel);

      x = 40;
      y = this._height - this._bottomBuffer;
      this._svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'end')
        .text(args.minY);

      y = 15;
      this._svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'end')
        .text(args.maxY);

      x = this._leftBuffer + ((this._width - this._leftBuffer) / 2);
      y = this._height - 5;
      this._svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .text(args.xLabel);

      x = this._leftBuffer;
      y = this._height - 18;
      this._svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'start')
        .text(args.minX);

      x = this._width;
      this._svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'end')
        .text(args.maxX);
    }
  };

})();
