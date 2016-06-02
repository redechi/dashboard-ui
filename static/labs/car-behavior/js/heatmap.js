(function() {

  var superClass = App.CanvasBase.prototype;

  // ----------
  var component = App.Heatmap = function(args) {
    this._data = args.data;
    this._mode = args.mode;
    this._initCanvas(args.$el);
    this.render();
  };

  // ----------
  component.prototype = _.extend({}, superClass, {
    // ----------
    render: function() {
      var self = this;

      // console.time('render');

      var modes = {
        style: {
          valueKey: 'totalTime',
          yGap: 1
        },
        efficiency: {
          valueKey: 'averageMpg',
          yGap: 1
        },
        horsepower: {
          valueKey: 'averageHorsepower',
          yGap: 50
        },
        torque: {
          valueKey: 'averageTorque',
          yGap: 50
        }
      };

      var valueKey = modes[this._mode].valueKey;
      var xGap = 2;
      var yGap = modes[this._mode].yGap;
      // TODO: pull the xGap and yGap out of the data

      var xExtent = (this._data.maxX - this._data.minX) + 1;
      var xFactor = this._width / xExtent;
      var columnWidth = this._width / (xExtent / xGap);

      var yExtent = (this._data.maxY - this._data.minY) + 1;
      var yFactor = this._width / yExtent;
      var rowHeight = this._height / (yExtent / yGap);

      var yScale = d3.scale.linear()
        .domain([self._data.maxY, self._data.minY])
        .range([0, this._height - rowHeight]);

      var domain = [];
      for (var i = 0; i < 7; i++) {
        domain.push(i * (1 / 6));
      }

      var colorScale = d3.scale.linear()
        .domain(domain)
        .range([
          '#101',
          '#f0f',
          '#00f',
          '#0f0',
          '#ff0',
          '#f80',
          '#f00'
        ]);

      this._context.fillStyle = '#181818';
      this._context.fillRect(0, 0, this._width, this._height);

      var maxValue = 0;
      _.each(this._data.grid, function(info, key) {
        maxValue = Math.max(maxValue, info[valueKey]);
      });

      _.each(this._data.grid, function(info, key) {
        var value = info[valueKey];
        if (!value) {
          return;
        }

        self._context.fillStyle = colorScale(value / maxValue);
        var x = (info.x - self._data.minX) * xFactor;
        var y = yScale(info.y);
        self._context.fillRect(x, y, columnWidth, rowHeight);
      });

      // console.timeEnd('render');
    }
  });

})();
