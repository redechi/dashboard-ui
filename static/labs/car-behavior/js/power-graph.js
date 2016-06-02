(function() {

  var superClass = App.TwoDGraph.prototype;

  // ----------
  var component = App.PowerGraph = function(args) {
    this._initCanvas(args.$el);
    this._buildData(args.data);
    this._updateData();
    this.render();
  };

  // ----------
  component.prototype = _.extend({}, superClass, {
    // ----------
    _buildData: function(heatmapData) {
      var hpData = {};
      var torqueData = {};

      _.each(heatmapData.grid, function(gridInfo) {
        var velocity = gridInfo.x;
        var rpm = gridInfo.y;

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

      this._sets = [
        {
          data: finish(hpData),
          color: '#f00'
        },
        {
          data: finish(torqueData),
          color: '#00f'
        }
      ];
    }
  });

})();
