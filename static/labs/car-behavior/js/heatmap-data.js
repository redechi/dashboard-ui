(function() {

  // ----------
  var component = App.HeatmapData = function(args) {
    this._buildData(args);
  };

  // ----------
  component.prototype = {
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

        var key = x + 'x' + y;
        var info = grid[key];
        if (!info) {
          info = {
            x: x,
            y: y,
            // we'll need to do something different for velocity if we ever
            // don't use vel_bin for either xKey or yKey
            velocity: datum.vel_bin,
            totalMafCount: 0,
            totalPowerCount: 0,
            totalTime: 0,
            totalMaf: 0,
            totalHorsepower: 0,
            totalTorque: 0
          };

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
        } else {
          info.averageMpg = 0;
        }

        if (info.totalPowerCount) {
          info.averageHorsepower = info.totalHorsepower / info.totalPowerCount;
          info.averageTorque = info.totalTorque / info.totalPowerCount;
        } else {
          info.averageHorsepower = 0;
          info.averageTorque = 0;
        }
      });

      this.grid = grid;
      this.minX = minX;
      this.minY = minY;
      this.maxX = maxX;
      this.maxY = maxY;
      this.xValues = _.unique(xValues).sort(function(a, b) { return a - b; });
      this.yValues = _.unique(yValues).sort(function(a, b) { return a - b; });

      // console.timeEnd('build');
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
