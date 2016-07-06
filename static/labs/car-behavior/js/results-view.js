(function() {

  // ----------
  var component = App.ResultsView = function(args) {
    var sets, groupSets;

    this.$el = App.template('results', {
      mode: args.mode,
      name: args.name
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
        data: args.singleData.accel,
        xLabel: 'MPH',
        yLabel: 'Acceleration (MPH/sec)',
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
        yLabel: 'Acceleration (MPH/sec)'
      });

      sets = args.singleData.accel.styleSets('#0bf');

      if (args.groupData) {
        sets = sets.concat(args.groupData.accel.styleSets('#f8f'));

        this.styleHeatmap2 = new App.Heatmap({
          $container: args.$container,
          $el: this.$el.find('.style-heatmap-svg').eq(1),
          mode: 'style',
          data: args.groupData.accel,
          xLabel: 'MPH',
          yLabel: 'Acceleration (MPH/sec)',
          yLabelFactor: App.milesPerKilometer,
          heatLabel: 'Time Spent (hours)'
        });
      }

      this.styleGraph.addSets(sets);

      var persona = args.singleData.raw.persona;
      if (persona) {
        leftInsight = 'Your persona is ' + persona + '.';
      }
    } else if (args.mode === 'efficiency') {
      this.efficiencyHeatmap = new App.Heatmap({
        $container: args.$container,
        $el: this.$el.find('.efficiency-heatmap-svg').eq(0),
        mode: 'efficiency',
        data: args.singleData.accel,
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

      sets = args.singleData.accel.efficiencySets('#0bf');
      leftInsight = 'Your optimal speed for fuel efficiency is ' + sets[0].optimalSpeed + ' MPH.';

      if (args.groupData) {
        groupSets = args.groupData.accel.efficiencySets('#f8f');
        sets = sets.concat(groupSets);
        rightInsight = 'The optimal speed for fuel efficiency for ' + args.groupName + ' is ' +
          groupSets[0].optimalSpeed + ' MPH.';

        this.efficiencyHeatmap2 = new App.Heatmap({
          $container: args.$container,
          $el: this.$el.find('.efficiency-heatmap-svg').eq(1),
          mode: 'efficiency',
          data: args.groupData.accel,
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
        data: args.singleData.rpm,
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

      sets = args.singleData.rpm.powerSets('#0bf');
      leftInsight = 'Your optimal RPM for power is ' + sets[0].optimalRpm + '.';

      if (args.groupData) {
        groupSets = args.groupData.rpm.powerSets('#f8f');
        sets = sets.concat(groupSets);
        rightInsight = 'The optimal RPM for power for ' + args.groupName + ' is ' +
          groupSets[0].optimalRpm + '.';

        this.horsepowerHeatmap2 = new App.Heatmap({
          $container: args.$container,
          $el: this.$el.find('.horsepower-heatmap-svg').eq(1),
          mode: 'horsepower',
          data: args.groupData.rpm,
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
    }
  };

})();
