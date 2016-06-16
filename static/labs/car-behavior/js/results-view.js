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
        $el: this.$el.find('.style-heatmap-canvas').eq(0),
        mode: 'style',
        data: args.singleData.accel
      });

      this.styleGraph = new App.TwoDGraph({
        name: 'style',
        $el: this.$el.find('.style-2d-graph-svg'),
        minX: App.minVelocity,
        maxX: App.maxVelocity
      });

      sets = args.singleData.accel.styleSets('#0bf');
      this.$el.find('.persona').text(args.singleData.raw.persona ? args.singleData.raw.persona : 'unknown');

      if (args.groupData) {
        sets = sets.concat(args.groupData.accel.styleSets('#f8f'));

        this.styleHeatmap2 = new App.Heatmap({
          $el: this.$el.find('.style-heatmap-canvas').eq(1),
          mode: 'style',
          data: args.groupData.accel
        });
      }

      this.styleGraph.addSets(sets);
    } else if (args.mode === 'efficiency') {
      this.efficiencyHeatmap = new App.Heatmap({
        $el: this.$el.find('.efficiency-heatmap-canvas').eq(0),
        mode: 'efficiency',
        data: args.singleData.accel
      });

      this.efficiencyGraph = new App.TwoDGraph({
        name: 'efficiency',
        $el: this.$el.find('.efficiency-2d-graph-svg'),
        minX: App.minVelocity,
        maxX: App.maxVelocity
      });

      sets = args.singleData.accel.efficiencySets('#0bf');
      this.$el.find('.optimal-efficiency').text(sets[0].optimalSpeed);

      if (args.groupData) {
        sets = sets.concat(args.groupData.accel.efficiencySets('#f8f'));

        this.efficiencyHeatmap2 = new App.Heatmap({
          $el: this.$el.find('.efficiency-heatmap-canvas').eq(1),
          mode: 'efficiency',
          data: args.groupData.accel
        });
      }

      this.efficiencyGraph.addSets(sets);
    } else if (args.mode === 'power') {
      this.horsepowerHeatmap = new App.Heatmap({
        $el: this.$el.find('.horsepower-heatmap-canvas').eq(0),
        mode: 'horsepower',
        data: args.singleData.rpm
      });

      this.torqueHeatmap = new App.Heatmap({
        $el: this.$el.find('.torque-heatmap-canvas').eq(0),
        mode: 'torque',
        data: args.singleData.rpm
      });

      this.powerGraph = new App.TwoDGraph({
        name: 'power',
        $el: this.$el.find('.power-2d-graph-svg'),
        minX: App.minRpm,
        maxX: App.maxRpm
      });

      sets = args.singleData.rpm.powerSets('#0bf');
      this.$el.find('.optimal-power').text(sets[0].optimalRpm);

      if (args.groupData) {
        sets = sets.concat(args.groupData.rpm.powerSets('#f8f'));

        this.horsepowerHeatmap2 = new App.Heatmap({
          $el: this.$el.find('.horsepower-heatmap-canvas').eq(1),
          mode: 'horsepower',
          data: args.groupData.rpm
        });

        this.torqueHeatmap2 = new App.Heatmap({
          $el: this.$el.find('.torque-heatmap-canvas').eq(1),
          mode: 'torque',
          data: args.groupData.rpm
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
