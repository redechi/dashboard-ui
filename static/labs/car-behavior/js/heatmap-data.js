(function() {

  // ----------
  var component = App.HeatmapData = function(args) {
    this._mafCountThreshold = args.mafCountThreshold || 1;
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

      this.minX = App.minKph;
      this.maxX = App.maxKph;

      if (yKey === 'accel_bin') {
        this.minY = App.minAccel;
        this.maxY = App.maxAccel;
      } else {
        this.minY = App.minRpm;
        this.maxY = App.maxRpm;
      }

      var grid = {};
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

        var outOfBounds = (x < self.minX || x > self.maxX || y < self.minY || y > self.maxY);
        if (outOfBounds) {
          return;
        }

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
        if (info.totalMafCount >= self._mafCountThreshold && info.totalMaf) {
          info.averageMaf = info.totalMaf / info.totalMafCount;
          info.averageMpg = self.mafToMpg(info.averageMaf, info.velocity);
        }

        if (info.totalPowerCount) {
          info.averageHorsepower = info.totalHorsepower / info.totalPowerCount;
          info.averageTorque = info.totalTorque / info.totalPowerCount;
        }
      });

      this.grid = grid;

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
    // result is:
    // x = mph
    // y = acceleration (kmph/sec?)
    styleSets: function(color) {
      var accels = {};
      var brakes = {};

      _.each(this.grid, function(gridInfo) {
        var velocity = gridInfo.x * App.milesPerKilometer;
        var accel = gridInfo.y;
        var set = (accel > 0 ? accels : (accel < 0 ? brakes : null));
        if (!set || !gridInfo.totalTime) {
          return;
        }

        var setInfo = set[velocity];
        if (!setInfo) {
          setInfo = {
            x: velocity,
            total: 0,
            time: 0
          };

          set[velocity] = setInfo;
        }

        setInfo.total += accel * gridInfo.totalTime;
        setInfo.time += gridInfo.totalTime;
      });

      var finish = function(set) {
        return _.chain(set)
          .map(function(v, i) {
            v.value = v.total / v.time;
            return v;
          })
          .sortBy(function(v, i) {
            return v.x;
          })
          .value();
      };

      return [
        {
          data: finish(accels),
          color: color
        },
        {
          data: finish(brakes),
          color: color
        }
      ];
    },

    // ----------
    // result is:
    // x = mph
    // y = mpg
    efficiencySets: function(color) {
      var self = this;

      var set = {};

      _.each(this.grid, function(gridInfo) {
        var velocity = gridInfo.x * App.milesPerKilometer;
        var accel = gridInfo.y;
        if (accel < 0 || accel > 2 || !gridInfo.averageMaf || !gridInfo.totalMafCount) {
          return;
        }

        var setInfo = set[velocity];
        if (!setInfo) {
          setInfo = {
            x: velocity,
            total: 0,
            count: 0
          };

          set[velocity] = setInfo;
        }

        setInfo.total += gridInfo.averageMaf * gridInfo.totalMafCount;
        setInfo.count += gridInfo.totalMafCount;
      });

      var finish = function(set) {
        return _.chain(set)
          .map(function(v, i) {
            v.value = self.mafToMpg(v.total / v.count, v.x);
            return v;
          })
          .sortBy(function(v, i) {
            return v.x;
          })
          .value();
      };

      var sets = [
        {
          data: finish(set),
          color: color
        }
      ];

      // "insight"
      var interval = 5;

      var mph = this._maxBucketValue({
        set: sets[0],
        interval: interval,
        updateAverage: function(bucket) {
          bucket.average = self.mafToMpg(bucket.average, bucket.x);
        }
      });

      var startMph = Math.round(mph);
      var endMph = Math.round(mph + interval);
      sets[0].optimalSpeed = startMph + '-' + endMph;

      return sets;
    },

    // ----------
    // result is:
    // x = rpm
    // y = hp and torque
    powerSets: function(color) {
      var hpData = {};
      var torqueData = {};

      _.each(this.grid, function(gridInfo) {
        var velocity = gridInfo.x;
        var rpm = gridInfo.y;

        if (velocity <= 0) {
          return;
        }

        // horsepower
        var hpInfo = hpData[rpm];
        if (!hpInfo) {
          hpInfo = {
            x: rpm,
            total: 0,
            count: 0
          };

          hpData[rpm] = hpInfo;
        }

        hpInfo.total += gridInfo.totalHorsepower;
        hpInfo.count += gridInfo.totalPowerCount;

        // torque
        var torqueInfo = torqueData[rpm];
        if (!torqueInfo) {
          torqueInfo = {
            x: rpm,
            total: 0,
            count: 0
          };

          torqueData[rpm] = torqueInfo;
        }

        torqueInfo.total += gridInfo.totalTorque;
        torqueInfo.count += gridInfo.totalPowerCount;
      });

      var finish = function(set) {
        return _.chain(set)
          .map(function(v, i) {
            if (v.total && v.count) {
              v.value = v.total / v.count;
            } else {
              v.value = 0;
            }

            return v;
          })
          .sortBy(function(v, i) {
            return v.x;
          })
          .value();
      };

      var sets = [
        {
          data: finish(hpData),
          color: color
        },
        {
          data: finish(torqueData),
          color: color
        }
      ];

      // "insight"
      var interval = 250;

      var startRpm = this._maxBucketValue({
        set: sets[0],
        interval: interval
      });

      sets[0].optimalRpm = startRpm + '-' + (startRpm + interval);

      return sets;
    }
  };

})();
