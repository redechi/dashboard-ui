(function() {

  var superClass = App.TwoDGraph.prototype;

  // ----------
  var component = App.EfficiencyGraph = function(args) {
    this.name = 'efficiency';
    this._initCanvas(args.$el);
    this._buildData(args.data);
    this._updateData();
    this.render();
  };

  // ----------
  component.prototype = _.extend({}, superClass, {
    // ----------
    _buildData: function(heatmapData) {
      var set = {};

      _.each(heatmapData.grid, function(gridInfo) {
        var velocity = gridInfo.x;
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
            v.value = heatmapData.mafToMpg(v.total / v.count, v.x);
            return v;
          })
          .sortBy(function(v, i) {
            return v.x;
          })
          .value();
      };

      this._sets = [
        {
          data: finish(set),
          color: '#00'
        }
      ];

// TODO:
// Algorithm to calculate Optimal Speed for Fuel Efficiency
// Using the 2D MPG vs velocity graph, starting from 0-10mph in intervals of 5 (5-15, 10-15, 15-20, etc.), find the range with the maximum average MPG.
// *we’ll also tell users to check out the 3D graph to see how accelerating effects their MPG at various speeds

      this.optimalSpeed = '???';
    }
  });

})();
