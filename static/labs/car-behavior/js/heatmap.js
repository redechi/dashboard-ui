(function() {

  var superClass = App.CanvasBase.prototype;

  // ----------
  var component = App.Heatmap = function(args) {
    var modes = {
      style: {
        valueKey: 'totalTime'
      },
      efficiency: {
        valueKey: 'averageMpg'
      },
      horsepower: {
        valueKey: 'averageHorsepower'
      },
      torque: {
        valueKey: 'averageTorque'
      }
    };

    this._mode = args.mode;
    this._valueKey = modes[this._mode].valueKey;
    this._data = args.data;
    this._initCanvas(args.$el);
    this._smoothData();
    this.render();
  };

  // ----------
  component.prototype = _.extend({}, superClass, {
    // ----------
    render: function() {
      var self = this;

      // console.time('render');

      var xExtent = (this._data.maxX - this._data.minX) + 1;
      var xFactor = this._width / xExtent;
      var columnWidth = this._width / (xExtent / this._data.xInterval);

      var yExtent = (this._data.maxY - this._data.minY) + 1;
      var yFactor = this._width / yExtent;
      var rowHeight = this._height / (yExtent / this._data.yInterval);

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
      _.each(this._smoothedGrid, function(info, key) {
        maxValue = Math.max(maxValue, info[self._valueKey]);
      });

      _.each(this._smoothedGrid, function(info, key) {
        var value = info[self._valueKey];
        if (!value) {
          return;
        }

        self._context.fillStyle = colorScale(value / maxValue);
        var x = (info.x - self._data.minX) * xFactor;
        var y = yScale(info.y);
        self._context.fillRect(x, y, columnWidth, rowHeight);
      });

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
      for (y = this._data.minY; y <= this._data.maxY; y += this._data.yInterval) {
        for (x = this._data.minX; x <= this._data.maxX; x += this._data.xInterval) {
          smooth(x, y);
        }
      }

      this._smoothedGrid = newGrid;

      // console.timeEnd('smooth');
    }
  });

})();
