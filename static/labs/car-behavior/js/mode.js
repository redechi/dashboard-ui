(function() {

  // ----------
  var component = App.Mode = function(args) {
    _.extend(this, _.pick(args, ['key', 'explanation', 'prompt', 'name']));
    this._comparisons = [];
  };

  // ----------
  component.prototype = {
    // ----------
    getComparison: function(singleData, groupData) {
      var self = this;

      if (!singleData || !groupData) {
        return;
      }

      var type = this.key;

      var dataKey = 'accel';
      if (this.key === 'power') {
        dataKey = 'rpm';
      }

      var dataMode = this.key;
      if (dataMode === 'power') {
        dataMode = 'horsepower';
      }

      var h1 = singleData[dataKey].getForComparison(dataMode);
      var h2 = groupData[dataKey].getForComparison(dataMode);

      App.request({
        path: 'compare-heatmaps/',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          type: type,
          h1: h1,
          h2: h2
        }),
        success: function(result) {
          self._comparisons = result;
          if (App.mode === self) {
            self._drawComparison();
          }
        },
        error: function(errorThrown) {
          $('.error').text('Unable to load comparison.');
        }
      });
    },

    // ----------
    select: function() {
      this._drawComparison();
    },

    // ----------
    _drawComparison: function() {
      var self = this;

      $('.comparison').empty();

      if (this._comparisons.length) {
        App.template('comparison', {
          title: this.name + ' Comparison',
          comparisons: _.map(this._comparisons, function(comparison) {
            var singleValue = comparison.value[0] || 0;
            var groupValue = comparison.value[1] || 0;
            var scale = d3.scale.linear()
              .domain([0, Math.max(singleValue, groupValue)])
              .range([0, 100]);

            return {
              key: comparison.key,
              singlePercent: scale(singleValue),
              groupPercent: scale(groupValue),
              singleTip: self._comparisonTip(singleValue, groupValue),
              groupTip: self._comparisonTip(groupValue, singleValue),
            };
          }),
          key: this.key
        }).appendTo('.comparison');
      }
    },

    // ----------
    _comparisonTip: function(value, otherValue) {
      if (!otherValue) {
        return '';
      }

      var factor, word;
      if (value > otherValue) {
        factor = (value - otherValue) / otherValue;
        word = 'more';
      } else if (value < otherValue) {
        factor = 1 - (value / otherValue);
        word = 'less';
      } else {
        return 'same';
      }

      var percent = factor * 100;
      if (percent < 0.5) {
        percent = Math.round(percent * 10) / 10;
      } else {
        percent = Math.round(percent);
      }

      var extra = '';
      if (this.key === 'efficiency') {
        extra = ' efficient';
      }

      return percent + '% ' + word + extra;
    }
  };

})();
