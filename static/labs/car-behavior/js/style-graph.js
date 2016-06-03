(function() {

  var superClass = App.TwoDGraph.prototype;

  // ----------
  var component = App.StyleGraph = function(args) {
    this.name = 'style';
    this._initCanvas(args.$el);
    this._buildData(args.data);
    this._updateData();
    this.render();
  };

  // ----------
  component.prototype = _.extend({}, superClass, {
    // ----------
    _buildData: function(heatmapData) {
      var accels = {};
      var brakes = {};

      _.each(heatmapData.grid, function(gridInfo) {
        var velocity = gridInfo.x;
        var accel = gridInfo.y;
        var set = (accel > 0 ? accels : (accel < 0 ? brakes : null));
        if (!set) {
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

      this._sets = [
        {
          data: finish(accels),
          color: '#f00'
        },
        {
          data: finish(brakes),
          color: '#00f'
        }
      ];
    }
  });

})();
