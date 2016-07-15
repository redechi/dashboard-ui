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
    // Expects:
    // args.leftData - object
    // args.rightData - object
    // args.leftOptionView - object
    // args.rightOptionView - object
    getComparison: function(args) {
      var self = this;

      if (!args.leftData || !args.rightData) {
        return;
      }

      this._leftOptionView = args.leftOptionView;
      this._rightOptionView = args.rightOptionView;

      var type = this.key;

      var dataKey = 'accel';
      if (this.key === 'power') {
        dataKey = 'rpm';
      }

      var h1 = args.leftData[dataKey].getForComparison(this.key);
      var h2 = args.rightData[dataKey].getForComparison(this.key);

      var data = JSON.stringify({
        type: type,
        fuel_type: [
          args.leftData.raw.diesel ? 'diesel' : 'gasoline',
          args.rightData.raw.diesel ? 'diesel' : 'gasoline'
        ],
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
              tooltip: self._comparisonTip(comparison.singleValue, comparison.groupValue)
            };
          }),
          key: this.key
        }).appendTo('.comparison');
      }
    },

    // ----------
    _comparisonTip: function(value, otherValue) {
      if (value === undefined || otherValue === undefined) {
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

      var output = '';
      if (this._leftOptionView.key === 'extra') {
        output += this._leftOptionView.name + ' are ';
      } else {
        output += 'Your ' + this._leftOptionView.name + ' is ';
      }

      output += percent + '% ' + word + extra + ' than ' + this._rightOptionView.name;
      return output;
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

      $('.comparison').on('mouseenter', '.graph', function(event) {
        var $graph = $(this);
        var text = $graph.data('tooltip');
        self._hideToolTip();

        self.$tooltip = $('<div>')
          .addClass('tooltip')
          .text(text)
          .appendTo('body');

        self._updateTooltip(event.clientX, event.clientY);
      });

      $('.comparison').on('mousemove', '.graph', function(event) {
        var $graph = $(this);
        self._updateTooltip(event.clientX, event.clientY);
      });

      $('.comparison').on('mouseleave', '.graph', function(event) {
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
