(function() {

  // ----------
  var component = App.ResultsView = function(args) {
    var sets;

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

    if (args.mode === 'style') {
      this.styleHeatmap = new App.Heatmap({
        $container: args.$container,
        $el: this.$el.find('.style-heatmap-svg').eq(0),
        mode: 'style',
        data: args.singleData.accel,
        xLabel: 'MPH',
        yLabel: 'Acceleration (kmph/sec)'
      });

      this.styleGraph = new App.TwoDGraph({
        name: 'style',
        $container: args.$container,
        $el: this.$el.find('.style-2d-graph-svg'),
        minX: App.minMph,
        maxX: App.maxMph,
        xLabel: 'MPH',
        yLabel: 'Acceleration (kmph/sec)'
      });

      sets = args.singleData.accel.styleSets('#0bf');
      this.$el.find('.persona').text(args.singleData.raw.persona ? args.singleData.raw.persona : 'unknown');

      if (args.groupData) {
        sets = sets.concat(args.groupData.accel.styleSets('#f8f'));

        this.styleHeatmap2 = new App.Heatmap({
          $container: args.$container,
          $el: this.$el.find('.style-heatmap-svg').eq(1),
          mode: 'style',
          data: args.groupData.accel,
          xLabel: 'MPH',
          yLabel: 'Acceleration (kmph/sec)'
        });
      }

      this.styleGraph.addSets(sets);
    } else if (args.mode === 'efficiency') {
      this.efficiencyHeatmap = new App.Heatmap({
        $container: args.$container,
        $el: this.$el.find('.efficiency-heatmap-svg').eq(0),
        mode: 'efficiency',
        data: args.singleData.accel,
        xLabel: 'MPH',
        yLabel: 'MPG'
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
      this.$el.find('.optimal-efficiency').text(sets[0].optimalSpeed);

      if (args.groupData) {
        sets = sets.concat(args.groupData.accel.efficiencySets('#f8f'));

        this.efficiencyHeatmap2 = new App.Heatmap({
          $container: args.$container,
          $el: this.$el.find('.efficiency-heatmap-svg').eq(1),
          mode: 'efficiency',
          data: args.groupData.accel,
          xLabel: 'MPH',
          yLabel: 'MPG'
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
        yLabel: 'RPM'
      });

      this.torqueHeatmap = new App.Heatmap({
        $container: args.$container,
        $el: this.$el.find('.torque-heatmap-svg').eq(0),
        mode: 'torque',
        data: args.singleData.rpm,
        xLabel: 'MPH',
        yLabel: 'RPM'
      });

      this.powerGraph = new App.TwoDGraph({
        name: 'power',
        $container: args.$container,
        $el: this.$el.find('.power-2d-graph-svg'),
        minX: App.minRpm,
        maxX: App.maxRpm,
        xLabel: 'RPM',
        yLabel: 'Power'
      });

      sets = args.singleData.rpm.powerSets('#0bf');
      this.$el.find('.optimal-power').text(sets[0].optimalRpm);

      if (args.groupData) {
        sets = sets.concat(args.groupData.rpm.powerSets('#f8f'));

        this.horsepowerHeatmap2 = new App.Heatmap({
          $container: args.$container,
          $el: this.$el.find('.horsepower-heatmap-svg').eq(1),
          mode: 'horsepower',
          data: args.groupData.rpm,
          xLabel: 'MPH',
          yLabel: 'RPM'
        });

        this.torqueHeatmap2 = new App.Heatmap({
          $container: args.$container,
          $el: this.$el.find('.torque-heatmap-svg').eq(1),
          mode: 'torque',
          data: args.groupData.rpm,
          xLabel: 'MPH',
          yLabel: 'RPM'
        });
      }

      this.powerGraph.addSets(sets);
    }

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
