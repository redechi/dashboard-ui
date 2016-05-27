(function() {

  // ----------
  var component = App.Heatmap = function(args) {
    this._data = args.data;
    this._mode = args.mode;
    this.$canvas = args.$el;
    this._context = this.$canvas[0].getContext('2d');
    this._width = this.$canvas.width();
    this._height = this.$canvas.height();

    this.$canvas.prop({
      width: this._width,
      height: this._height
    });

    this._buildData(args.data);
    this.render();
  };

  // ----------
  component.prototype = {
    // ----------
    _buildData: function(rawData) {
      // console.time('build');

      var grid = {};
      var minX = 0;
      var minY = 0;
      var maxX = 0;
      var maxY = 0;
      var maxValue = 0;
      // var velocities = [];
      // var accelerations = [];

      var AIR_FUEL_RATIO = 14.7; //unitless
      var DENSITY_OF_GAS = 6.175599; //lbs per gallon
      var GRAMS_PER_POUND = 454; //grams per pound
      var KILOMETERS_PER_HOUR_TO_MILES_PER_SECOND = 0.000172603;

      var modes = {
        style: {
          each: function(datum, info) {
            info.value += datum.time_spent;
            maxValue = Math.max(maxValue, info.value);
          }
        },
        efficiency: {
          each: function(datum, info) {
            if (info.y < 0) {
              return;
            }

            info.totalMaf = (info.totalMaf || 0) + (datum.maf_cnt * datum.avg_maf);
            info.totalCount = (info.totalCount || 0) + datum.maf_cnt;
          },
          after: function() {
            _.each(grid, function(info, key) {
              if (info.totalCount) {
                var averageMaf = info.totalMaf / info.totalCount;
                var velocity = info.x;
                var fuelMassPerSec = (averageMaf / 100) / AIR_FUEL_RATIO; //grams
                var fuelMassLbsPerSec = fuelMassPerSec / GRAMS_PER_POUND; //pounds
                var fuelVolumePerSec = fuelMassLbsPerSec / DENSITY_OF_GAS; //gallons
                var mpg = (velocity / KILOMETERS_PER_HOUR_TO_MILES_PER_SECOND) / fuelVolumePerSec;
                info.value = mpg;
                maxValue = Math.max(maxValue, info.value);
              } else {
                info.value = 0;
              }
            });
          }
        }
      };

      var modeEach = modes[this._mode].each;

      _.each(rawData.heatmap, function(datum) {
        var x = datum.vel_bin;
        var y = datum.accel_bin;
        var value = datum.time_spent;

        // velocities.push(x);
        // accelerations.push(y);

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);

        var key = x + 'x' + y;
        var info = grid[key];
        if (!info) {
          info = {
            x: x,
            y: y,
            value: 0
          };

          grid[key] = info;
        }

        modeEach(datum, info);
      });

      if (modes[this._mode].after) {
        modes[this._mode].after();
      }

      this._grid = grid;
      this._minX = minX;
      this._minY = minY;
      this._maxX = maxX;
      this._maxY = maxY;
      this._maxValue = maxValue;
      // this._velocities = _.unique(velocities).sort(function(a, b) { return a - b; });
      // this._accelerations = _.unique(accelerations).sort(function(a, b) { return a - b; });

      // console.timeEnd('build');
    },

    // ----------
    render: function() {
      var self = this;

      // console.time('render');

      var xExtent = this._maxX - this._minX;
      var columnWidth = this._width / (xExtent + 2);
      var yExtent = this._maxY - this._minY;
      var rowHeight = this._height / (yExtent + 1);

      var yScale = d3.scale.linear()
        .domain([self._maxY, self._minY])
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

      _.each(this._grid, function(info, key) {
        if (!info.value) {
          return;
        }

        self._context.fillStyle = colorScale((info.value) / (self._maxValue));
        var x = (info.x - self._minX) * columnWidth;
        var y = yScale(info.y);
        self._context.fillRect(x, y, columnWidth * 2, rowHeight);
      });

      // console.timeEnd('render');
    }
  };

})();
