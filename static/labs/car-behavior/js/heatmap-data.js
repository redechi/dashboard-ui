(function() {

  // ----------
  var component = App.HeatmapData = function(args) {
    this._buildData(args);
    this._fillInData();
  };

  // ----------
  component.prototype = {
    // ----------
    key: function(x, y) {
      return x + 'x' + y;
    },

    // ----------
    _blankInfo: function(x, y) {
      var info = {
        x: x,
        y: y,
        velocity: 0,
        totalMafCount: 0,
        totalPowerCount: 0,
        totalTime: 0,
        totalMaf: 0,
        totalHorsepower: 0,
        totalTorque: 0,
        averageMaf: 0,
        averageMpg: 0,
        averageHorsepower: 0,
        averageTorque: 0
      };

      return info;
    },

    // ----------
    _buildData: function(args) {
      var self = this;

      // console.time('build');

      var rawData = args.rawData;
      var xKey = args.x;
      var yKey = args.y;

      var grid = {};
      var minX = 0;
      var minY = 0;
      var maxX = 0;
      var maxY = 0;
      var xValues = [];
      var yValues = [];

      var KILOMETERS_PER_HOUR_TO_METERS_PER_SECOND = 0.277778;
      var WATTS_PER_HP = 745.7;
      var HP_TO_FT_LBS_RPM = 5252;

      var getHorsepower = function(datum) {
        var accel_meters_per_second2 = datum.accel_bin * KILOMETERS_PER_HOUR_TO_METERS_PER_SECOND; // convert k/h/s to m/s2
        var velocity_meters_per_second = datum.vel_bin * KILOMETERS_PER_HOUR_TO_METERS_PER_SECOND; // convert kph to m/s
        var horsepower = rawData.weight_kg * accel_meters_per_second2 * velocity_meters_per_second / WATTS_PER_HP;
        return horsepower;
      };

      _.each(rawData.heatmap, function(datum) {
        var x = datum[xKey];
        var y = datum[yKey];

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);

        xValues.push(x);
        yValues.push(y);

        var key = self.key(x, y);
        var info = grid[key];
        if (!info) {
          info = self._blankInfo(x, y);

          // we'll need to do something different for velocity if we ever
          // don't use vel_bin for either xKey or yKey
          info.velocity = datum.vel_bin;

          grid[key] = info;
        }

        info.totalTime += datum.time_spent;

        if (datum.accel_bin >= 0 && datum.avg_maf) {
          info.totalMafCount += datum.maf_cnt;
          info.totalMaf += datum.maf_cnt * datum.avg_maf;
        }

        if (datum.accel_bin > 0) {
          var horsepower = getHorsepower(datum);
          var torque = horsepower * HP_TO_FT_LBS_RPM / datum.rpm_bin;
          info.totalPowerCount++;
          info.totalHorsepower += horsepower;
          info.totalTorque += torque;
        }
      });

      _.each(grid, function(info, key) {
        if (info.totalMafCount && info.totalMaf) {
          info.averageMaf = info.totalMaf / info.totalMafCount;
          info.averageMpg = self.mafToMpg(info.averageMaf, info.velocity);
        }

        if (info.totalPowerCount) {
          info.averageHorsepower = info.totalHorsepower / info.totalPowerCount;
          info.averageTorque = info.totalTorque / info.totalPowerCount;
        }
      });

      this.grid = grid;
      this.minX = minX;
      this.minY = minY;
      this.maxX = maxX;
      this.maxY = maxY;

      xValues = _.unique(xValues).sort(function(a, b) { return a - b; });
      yValues = _.unique(yValues).sort(function(a, b) { return a - b; });
      this.xInterval = this._getCommonInterval(xValues);
      this.yInterval = this._getCommonInterval(yValues);

      _.each(xValues, function(x) {
        var x1 = x / self.xInterval;
        if (x1 !== Math.floor(x1)) {
          console.warn('x does not fit interval', x);
        }
      });

      _.each(yValues, function(y) {
        var y1 = y / self.yInterval;
        if (y1 !== Math.floor(y1)) {
          console.warn('y does not fit interval', y);
        }
      });

      // console.timeEnd('build');
    },

    // ----------
    _getCommonInterval: function(values) {
      var gaps = [];
      var i;
      for (i = 0; i < values.length - 1; i++) {
        gaps.push(values[i + 1] - values[i]);
      }

      gaps = _.groupBy(gaps, function(v, i) {
        return v;
      });

      var interval = _.max(gaps, function(v, i) {
        return v.length;
      })[0];

      return interval;
    },

    // ----------
    _fillInData: function() {
      var self = this;

      // console.time('fillIn');

      var x, y, key, info;
      for (y = this.minY; y <= this.maxY; y += this.yInterval) {
        for (x = this.minX; x <= this.maxX; x += this.xInterval) {
          key = this.key(x, y);
          info = this.grid[key];
          if (!info) {
            this.grid[key] = this._blankInfo(x, y);
          }
        }
      }

      // console.timeEnd('fillIn');
    },

    // ----------
    mafToMpg: function(maf, velocity) {
      var AIR_FUEL_RATIO = 14.7; //unitless
      var DENSITY_OF_GAS = 6.175599; //lbs per gallon
      var GRAMS_PER_POUND = 454; //grams per pound
      var KILOMETERS_PER_HOUR_TO_MILES_PER_SECOND = 0.000172603;

      var fuelMassPerSec = (maf / 100) / AIR_FUEL_RATIO; //grams
      var fuelMassLbsPerSec = fuelMassPerSec / GRAMS_PER_POUND; //pounds
      var fuelVolumePerSec = fuelMassLbsPerSec / DENSITY_OF_GAS; //gallons
      var mpg = (velocity / KILOMETERS_PER_HOUR_TO_MILES_PER_SECOND) / fuelVolumePerSec;
      return mpg;
    }
  };

})();
