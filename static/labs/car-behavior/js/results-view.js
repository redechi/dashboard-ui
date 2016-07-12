(function() {

  // ----------
  // Expects:
  // args.mode - string
  // args.$container - jQuery object
  // args.leftData - object
  // args.rightData - object
  // args.leftOptionView - object
  // args.rightOptionView - object
  var component = App.ResultsView = function(args) {
    var sets, groupSets;

    this.$el = App.template('results', {
      mode: args.mode,
    }).appendTo(args.$container);

    this.$el.find('.graph-mode-toggle').on('click', function() {
      $('body').removeClass('heatmap-mode');
      $('body').addClass('graph-mode');
    });

    this.$el.find('.heatmap-mode-toggle').on('click', function() {
      $('body').removeClass('graph-mode');
      $('body').addClass('heatmap-mode');
    });

    var leftInsight = '';
    var rightInsight = '';

    if (args.mode === 'style') {
      this.styleHeatmap = new App.Heatmap({
        $container: args.$container,
        $el: this.$el.find('.style-heatmap-svg').eq(0),
        mode: 'style',
        data: args.leftData.accel,
        xLabel: 'MPH',
        yLabel: 'MPH/sec',
        maxYLabel: 'Acceleration',
        minYLabel: 'Braking',
        yLabelFactor: App.milesPerKilometer,
        heatLabel: 'Time Spent (hours)'
      });

      this.styleGraph = new App.TwoDGraph({
        name: 'style',
        $container: args.$container,
        $el: this.$el.find('.style-2d-graph-svg'),
        minX: App.minMph,
        maxX: App.maxMph,
        xLabel: 'MPH',
        yLabel: 'MPH/sec',
        maxYLabel: 'Acceleration',
        minYLabel: 'Braking'
      });

      sets = args.leftData.accel.styleSets('#0bf');

      if (args.rightData) {
        sets = sets.concat(args.rightData.accel.styleSets('#f8f'));

        this.styleHeatmap2 = new App.Heatmap({
          $container: args.$container,
          $el: this.$el.find('.style-heatmap-svg').eq(1),
          mode: 'style',
          data: args.rightData.accel,
          xLabel: 'MPH',
          yLabel: 'MPH/sec',
          maxYLabel: 'Acceleration',
          minYLabel: 'Braking',
          yLabelFactor: App.milesPerKilometer,
          heatLabel: 'Time Spent (hours)'
        });
      }

      this.styleGraph.addSets(sets);

      var persona = args.leftData.raw.persona;
      if (persona && args.leftOptionView.key !== 'extra') {
        leftInsight = 'Your persona is ' + persona + '.';
      }
    } else if (args.mode === 'efficiency') {
      this.efficiencyHeatmap = new App.Heatmap({
        $container: args.$container,
        $el: this.$el.find('.efficiency-heatmap-svg').eq(0),
        mode: 'efficiency',
        data: args.leftData.accel,
        xLabel: 'MPH',
        yLabel: 'Acceleration (MPH/sec)',
        minY: 0,
        heatLabel: 'MPG'
      });

      this.efficiencyGraph = new App.TwoDGraph({
        name: 'efficiency',
        $container: args.$container,
        $el: this.$el.find('.efficiency-2d-graph-svg'),
        minX: App.minMph,
        maxX: App.maxMph,
        xLabel: 'MPH',
        yLabel: 'MPG'
      });

      sets = args.leftData.accel.efficiencySets('#0bf');
      if (args.leftOptionView.key === 'extra') {
        leftInsight = 'The optimal speed for fuel efficiency for ' + args.leftOptionView.name +
          ' is ' + sets[0].optimalSpeed + ' MPH.';
      } else {
        leftInsight = 'Your optimal speed for fuel efficiency is ' + sets[0].optimalSpeed + ' MPH.';
      }

      if (args.rightData) {
        groupSets = args.rightData.accel.efficiencySets('#f8f');
        sets = sets.concat(groupSets);
        rightInsight = 'The optimal speed for fuel efficiency for ' + args.rightOptionView.name + ' is ' +
          groupSets[0].optimalSpeed + ' MPH.';

        this.efficiencyHeatmap2 = new App.Heatmap({
          $container: args.$container,
          $el: this.$el.find('.efficiency-heatmap-svg').eq(1),
          mode: 'efficiency',
          data: args.rightData.accel,
          xLabel: 'MPH',
          yLabel: 'Acceleration (MPH/sec)',
          minY: 0,
          heatLabel: 'MPG'
        });
      }

      this.efficiencyGraph.addSets(sets);
    } else if (args.mode === 'power') {
      this.horsepowerHeatmap = new App.Heatmap({
        $container: args.$container,
        $el: this.$el.find('.horsepower-heatmap-svg').eq(0),
        mode: 'horsepower',
        data: args.leftData.rpm,
        xLabel: 'MPH',
        yLabel: 'RPM',
        heatLabel: 'Horsepower'
      });

      this.powerGraph = new App.TwoDGraph({
        name: 'power',
        $container: args.$container,
        $el: this.$el.find('.power-2d-graph-svg'),
        minX: App.minRpm,
        maxX: App.maxRpm,
        minY: 0,
        xLabel: 'RPM',
        yLabel: 'Horsepower - dots',
        yLabel2: 'Torque (lb ft) - circles',
        scatter: true
      });

      sets = args.leftData.rpm.powerSets('#0bf');
      if (args.leftOptionView.key === 'extra') {
        leftInsight = 'The optimal RPM for power for ' + args.leftOptionView.name + ' is ' +
          sets[0].optimalRpm + '.';
      } else {
        leftInsight = 'Your optimal RPM for power is ' + sets[0].optimalRpm + '.';
      }

      if (args.rightData) {
        groupSets = args.rightData.rpm.powerSets('#f8f');
        sets = sets.concat(groupSets);
        rightInsight = 'The optimal RPM for power for ' + args.rightOptionView.name + ' is ' +
          groupSets[0].optimalRpm + '.';

        this.horsepowerHeatmap2 = new App.Heatmap({
          $container: args.$container,
          $el: this.$el.find('.horsepower-heatmap-svg').eq(1),
          mode: 'horsepower',
          data: args.rightData.rpm,
          xLabel: 'MPH',
          yLabel: 'RPM',
          heatLabel: 'Horsepower'
        });
      }

      this.powerGraph.addSets(sets);
    }

    $('.left-insight').text(leftInsight);
    $('.right-insight').text(rightInsight);

    this.$el.fadeIn();
  };

  // ----------
  component.prototype = {
    // ----------
    destroy: function() {
      this.$el.remove();
      $('.left-insight').text('');
      $('.right-insight').text('');
    }
  };

})();
