(function() {

  var numericSort = function(a, b) { return a - b; };

  // ----------
  var component = App.HeatmapData = function(args) {
    this._isGroup = args.isGroup;
    this._mafCountThreshold = (this._isGroup ? 50 : 10);
    this._rawData = args.rawData;
    this._buildData(args);
    this._fillInData();
  };

  // ----------
  component.prototype = {
    _modeValueKeys: {
      style: 'totalTime',
      efficiency: 'averageMpg',
      horsepower: 'maxHorsepower',
      torque: 'maxTorque'
    },

    _comparisonValueKeys: {
      style: 'totalTime',
      efficiency: 'averageMaf',
      power: 'maxHorsepower'
    },

    // ----------
    key: function(x, y) {
      return x + 'x' + y;
    },

    // ----------
    valueKey: function(mode) {
      return this._modeValueKeys[mode];
    },

    // ----------
    valueKeyForComparison: function(mode) {
      return this._comparisonValueKeys[mode];
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
        averageTorque: 0,
        maxHorsepower: 0,
        maxTorque: 0,
        horsepowers: [],
        torques: []
      };

      return info;
    },

    // ----------
    _percentile: function(values, factor) {
      if (!values.length) {
        return 0;
      }

      return values[Math.round((values.length - 1) * factor)];
    },

    // ----------
    _buildData: function(args) {
      var self = this;

      // console.time('build');

      var rawData = args.rawData;
      var xKey = args.x;
      var yKey = args.y;

      if (yKey === 'accel_bin') { // For efficiency and style
        this.minX = App.minKph;
        this.maxX = App.maxKph;
        this.minY = App.minAccel;
        this.maxY = App.maxAccel;
      } else { // For power
        this.minX = App.minRpm;
        this.maxX = App.maxRpm;
        this.minY = App.minKph;
        this.maxY = App.maxKph;
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
          info.horsepowers.push(horsepower);
          info.torques.push(torque);
        }
      });

      _.each(grid, function(info, key) {
        if (info.totalMafCount >= self._mafCountThreshold && info.totalMaf) {
          info.averageMaf = info.totalMaf / info.totalMafCount;
          info.averageMpg = self.mafToMpg(info.averageMaf, info.velocity, rawData.diesel);
        }

        if (info.totalPowerCount >= 2) {
          info.averageHorsepower = info.totalHorsepower / info.totalPowerCount;
          info.averageTorque = info.totalTorque / info.totalPowerCount;
        }

        if (info.horsepowers.length >= 2) {
          info.horsepowers.sort(numericSort);
          info.maxHorsepower = self._percentile(info.horsepowers, 0.9);
        }

        if (info.torques.length >= 2) {
          info.torques.sort(numericSort);
          info.maxTorque = self._percentile(info.torques, 0.9);
        }
      });

      this.grid = grid;

      xValues = _.unique(xValues).sort(numericSort);
      yValues = _.unique(yValues).sort(numericSort);
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
    mafToMpg: function(maf, velocity, diesel) {
      var AIR_FUEL_RATIO = 14.7; //unitless
      var AIR_FUEL_RATIO_DIESEL = 14.6;
      var DENSITY_OF_GAS = 6.175599; //lbs per gallon
      var DENSITY_OF_GAS_DIESEL = 7.060212;
      var GRAMS_PER_POUND = 454; //grams per pound
      var KILOMETERS_PER_HOUR_TO_MILES_PER_SECOND = 0.000172603;

      var airFuelRatio = diesel ? AIR_FUEL_RATIO_DIESEL : AIR_FUEL_RATIO;
      var densityOfGas = diesel ? DENSITY_OF_GAS_DIESEL : DENSITY_OF_GAS;

      var fuelMassPerSec = (maf / 100) / airFuelRatio; //grams
      var fuelMassLbsPerSec = fuelMassPerSec / GRAMS_PER_POUND; //pounds
      var fuelVolumePerSec = fuelMassLbsPerSec / densityOfGas; //gallons
      var mpg = (velocity * KILOMETERS_PER_HOUR_TO_MILES_PER_SECOND) / fuelVolumePerSec;
      return mpg;
    },

    // ----------
    // Expects:
    // args.data - array of objects with x, value
    // args.interval - number
    // args.bucketSize - number
    _maxBucketValue: function(args) {
      // console.time('_maxBucketValue');

      var buckets = {};
      var i, bucket, max;
      var bucketSize = args.bucketSize || args.interval;
      var interval = args.interval;

      _.each(args.data, function(info) {
        var x = info.x;

        for (i = 0; i <= x; i += interval) {
          if (i + bucketSize > x) {
            bucket = buckets[i];
            if (!bucket) {
              bucket = buckets[i] = {
                total: 0,
                count: 0
              };
            }

            bucket.total += info.value;
            bucket.count++;
          }
        }
      });

      _.each(buckets, function(bucket, x) {
        var average = bucket.total / bucket.count;
        if (!max || max.average < average) {
          max = {
            average: average,
            x: x
          };
        }
      });

      // console.timeEnd('_maxBucketValue');

      return max ? parseFloat(max.x) : 0;
    },

    // ----------
    // result is:
    // x = mph
    // y = acceleration (kmph/sec?)
    styleSets: function(color) {
      var self = this;
      var MIN_PER_HOUR = 60;
      var SEC_PER_MIN = 60;
      var accels = {};
      var brakes = {};

      _.each(this._rawData.heatmap, function(datum) {
        var velocity = datum.vel_bin * App.milesPerKilometer;
        var accel = datum.accel_bin * App.milesPerKilometer;
        var set = (accel > 0 ? accels : (accel < 0 ? brakes : null));
        var time = datum.time_spent;
        if (!set || !time) {
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

        setInfo.total += accel * time;
        setInfo.time += time;
      });

      var finish = function(set) {
        var output = _.chain(set)
          .map(function(v, i) {
            v.value = v.total / v.time;
            return v;
          })
          .sortBy(function(v, i) {
            return v.x;
          })
          .value();

        var threshold = 30 / (SEC_PER_MIN * MIN_PER_HOUR); // 30 seconds, expressed in hours
        output = _.filter(output, function(v, i) {
          return v.time >= threshold;
        });

        return output;
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

      _.each(this._rawData.heatmap, function(datum) {
        var velocity = datum.vel_bin * App.milesPerKilometer;
        var accel = datum.accel_bin;
        var count = datum.maf_cnt;
        var averageMaf = datum.avg_maf;
        if (accel !== 1 || !averageMaf || !count) {
          return;
        }

        var setInfo = set[velocity];
        if (!setInfo) {
          setInfo = {
            x: velocity,
            count: 0,
            values: []
          };

          set[velocity] = setInfo;
        }

        setInfo.count += count;
        setInfo.values.push(averageMaf);
      });

      var finish = function(set) {
        var output = _.chain(set)
          .map(function(v, i) {
            var maf = self._percentile(v.values.sort(numericSort), 0.5);
            v.value = self.mafToMpg(maf, v.x / App.milesPerKilometer, self._rawData.diesel);
            return v;
          })
          .sortBy(function(v, i) {
            return v.x;
          })
          .value();

        var threshold = self._isGroup ? 1000 : 60;
        output = _.filter(output, function(v, i) {
          return v.count >= threshold;
        });

        return output;
      };

      var sets = [
        {
          data: finish(set),
          color: color
        }
      ];

      // "insight"
      var bucketSize = 10;
      var interval = 5;

      var mph = this._maxBucketValue({
        data: sets[0].data,
        interval: interval,
        bucketSize: bucketSize
      });

      var startMph = Math.round(mph);
      var endMph = Math.round(mph + bucketSize);
      sets[0].optimalSpeed = startMph + '-' + endMph;

      return sets;
    },

    // ----------
    // result is:
    // x = rpm
    // y = hp and torque
    powerSets: function(color) {
      var self = this;
      var hpData = {};
      var torqueData = {};

      _.each(this.grid, function(gridInfo) {
        var rpm = gridInfo.x;
        var velocity = gridInfo.y;

        if (velocity <= 0) {
          return;
        }

        // horsepower
        var hpInfo = hpData[rpm];
        if (!hpInfo) {
          hpInfo = {
            x: rpm,
            count: 0,
            values: []
          };

          hpData[rpm] = hpInfo;
        }

        hpInfo.count += gridInfo.totalPowerCount;
        hpInfo.values = hpInfo.values.concat(gridInfo.horsepowers);

        // torque
        var torqueInfo = torqueData[rpm];
        if (!torqueInfo) {
          torqueInfo = {
            x: rpm,
            count: 0,
            values: []
          };

          torqueData[rpm] = torqueInfo;
        }

        torqueInfo.count += gridInfo.totalPowerCount;
        torqueInfo.values = torqueInfo.values.concat(gridInfo.torques);
      });

      var finish = function(set) {
        var output = _.chain(set)
          .map(function(v, i) {
            v.value = self._percentile(v.values.sort(numericSort), 0.9);
            return v;
          })
          .sortBy(function(v, i) {
            return v.x;
          })
          .value();

        var threshold = 30;
        output = _.filter(output, function(v, i) {
          return v.count >= threshold;
        });

        return output;
      };

      var sets = [
        {
          data: finish(hpData),
          color: color
        },
        {
          data: finish(torqueData),
          color: color,
          dashed: true
        }
      ];

      // "insight"
      var interval = 250;

      var startRpm = this._maxBucketValue({
        data: sets[0].data,
        interval: interval
      });

      sets[0].optimalRpm = startRpm + '-' + (startRpm + interval);

      return sets;
    },

    // ----------
    getForComparison: function(mode) {
      var output = [];
      var valueKey = this.valueKeyForComparison(mode);

      if (mode === 'power') {
        console.warn('Power comparisons are not yet supported');
        return output;
      }

      var x, y, column, info, value;
      var minX = 0;
      var maxX = 158;
      var xInterval = 2;
      var minY = -22;
      var maxY = 21;
      var yInterval = 1;

      for (x = minX; x <= maxX; x += xInterval) {
        column = [];
        output.push(column);
        for (y = minY; y <= maxY; y += yInterval) {
          info = this.grid[this.key(x, y)];
          value = 0;
          if (info) {
            value = info[valueKey];
          }

          column.push(value);
        }
      }

      return output;
    }
  };

})();
