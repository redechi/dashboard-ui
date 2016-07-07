(function() {

  // ----------
  var component = App.Mode = function(args) {
    component.init();
    _.extend(this, _.pick(args, ['key', 'explanation', 'prompt', 'name', 'comparisonText']));
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

      var data = JSON.stringify({
        type: type,
        h1: h1,
        h2: h2
      });

      // console.log(data);

      App.request({
        path: 'compare-heatmaps/',
        method: 'POST',
        contentType: 'application/json',
        data: data,
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
    clearComparison: function() {
      this._comparisons = [];
      if (App.mode === this) {
        this._drawComparison();
      }
    },

    // ----------
    select: function() {
      this._drawComparison();

      $('.tab').removeClass('selected');
      $('.tab[data-mode=' + this.key + ']').addClass('selected');
      $('.explanation').text(this.explanation);
      $('.prompt').text(this.prompt);

      var $faq = $('.faq').empty();
      App.template('faq', {
        mode: this.key
      }).appendTo($faq);

      $('.question').on('click', '.open-control, h3', function() {
        var questionDiv = $(this).parents('.question');
        questionDiv.toggleClass('open');
        $('.answer', questionDiv).slideToggle();
        $('.open-control', questionDiv).toggleClass('fa-chevron-down');
        $('.open-control', questionDiv).toggleClass('fa-chevron-up');
      });
    },

    // ----------
    _drawComparison: function() {
      var self = this;

      $('.comparison').empty();

      if (this._comparisons.length) {
        var overallMax = 0;
        var comparisons = _.map(this._comparisons, function(comparison) {
          var output = {
            singleValue: comparison.value[0] || 0,
            groupValue: comparison.value[1] || 0,
            key: comparison.key
          };

          output.max = Math.max(output.singleValue, output.groupValue);
          overallMax = Math.max(output.max, overallMax);
          return output;
        });

        App.template('comparison', {
          title: this.name + ' Comparison',
          text: this.comparisonText,
          comparisons: _.map(comparisons, function(comparison) {
            var max;
            if (self.key === 'style') {
              max = 1;
            } else if (self.key === 'efficiency') {
              max = overallMax;
            } else {
              max = comparison.max;
            }

            var scale = d3.scale.linear()
              .domain([0, max])
              .range([0, 100])
              .clamp(true);

            return {
              key: comparison.key,
              singlePercent: scale(comparison.singleValue),
              groupPercent: scale(comparison.groupValue),
              singleTip: self._comparisonTip(comparison.singleValue, comparison.groupValue),
              groupTip: self._comparisonTip(comparison.groupValue, comparison.singleValue),
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
      } else if (this.key === 'style') {
        extra = ' aggressive';
      }

      return percent + '% ' + word + extra;
    }
  };

  // ----------
  _.extend(component, {
    // ----------
    init: function() {
      var self = this;

      if (this._initialized) {
        return;
      }

      $('.comparison').on('mouseenter', '.bar', function(event) {
        var $bar = $(this);
        var text = $bar.data('tooltip');
        self._hideToolTip();

        self.$tooltip = $('<div>')
          .addClass('tooltip')
          .text(text)
          .appendTo('body');

        self._updateTooltip(event.clientX, event.clientY);
      });

      $('.comparison').on('mousemove', '.bar', function(event) {
        var $bar = $(this);
        self._updateTooltip(event.clientX, event.clientY);
      });

      $('.comparison').on('mouseleave', '.bar', function(event) {
        self._hideToolTip();
      });

      this._initialized = true;
    },

    // ----------
    _updateTooltip: function(x, y) {
      if (this.$tooltip) {
        var scrollTop = $(window).scrollTop();
        y += scrollTop;

        this.$tooltip
          .css({
            left: x,
            top: y - 40
          });
      }
    },

    // ----------
    _hideToolTip: function() {
      if (this.$tooltip) {
        this.$tooltip.remove();
        this.$tooltip = null;
      }
    }
  });

})();
