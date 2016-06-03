(function() {

  var superClass = App.CanvasBase.prototype;

  // ----------
  var component = App.TwoDGraph = function() {
  };

  // ----------
  component.prototype = _.extend({}, superClass, {
    // ----------
    _updateData: function() {
      var self = this;
      var minX = Infinity;
      var maxX = 0;
      var minValue = Infinity;
      var maxValue = 0;

      _.each(this._sets, function(set, setIndex) {
        _.each(set.data, function(datum) {
          if (_.isNaN(datum.x) || _.isNaN(datum.value)) {
            console.warn('NaN data for ' + self.name + ', set ' + setIndex + ':', datum);
            return;
          }

          minX = Math.min(minX, datum.x);
          maxX = Math.max(maxX, datum.x);
          minValue = Math.min(minValue, datum.value);
          maxValue = Math.max(maxValue, datum.value);
        });
      });

      this._minX = minX;
      this._maxX = maxX;
      this._minValue = minValue;
      this._maxValue = maxValue;

      this._xScale = d3.scale.linear()
        .domain([this._minX, this._maxX])
        .range([0, this._width]);

      this._yScale = d3.scale.linear()
        .domain([this._minValue, this._maxValue])
        .range([this._height, 0]);
    },

    // ----------
    _renderSet: function(set) {
      var self = this;

      this._context.strokeStyle = set.color;
      this._context.beginPath();
      _.each(set.data, function(v, i) {
        var x = self._xScale(v.x);
        var y = self._yScale(v.value);
        if (i === 0) {
          self._context.moveTo(x, y);
        } else {
          self._context.lineTo(x, y);
        }
      });

      this._context.stroke();
    },

    // ----------
    render: function() {
      var self = this;

      // console.time('render');

      this._context.fillStyle = '#ddd';
      this._context.fillRect(0, this._yScale(0), this._width, 1);

      _.each(this._sets, function(set) {
        self._renderSet(set);
      });

      // console.timeEnd('render');
    }
  });

})();
