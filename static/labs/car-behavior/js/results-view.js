(function() {

  // ----------
  var component = App.ResultsView = function(args) {
    this.$el = App.template('results', {
      name: args.name
    }).appendTo(args.$container);

    var accelData = new App.HeatmapData({
      rawData: args.data,
      x: 'vel_bin',
      y: 'accel_bin'
    });

    var rpmData = new App.HeatmapData({
      rawData: args.data,
      x: 'vel_bin',
      y: 'rpm_bin'
    });

    // heatmaps
    this.styleHeatmap = new App.Heatmap({
      $el: this.$el.find('.style-heatmap-canvas'),
      mode: 'style',
      data: accelData
    });

    this.efficiencyHeatmap = new App.Heatmap({
      $el: this.$el.find('.efficiency-heatmap-canvas'),
      mode: 'efficiency',
      data: accelData
    });

    this.horsepowerHeatmap = new App.Heatmap({
      $el: this.$el.find('.horsepower-heatmap-canvas'),
      mode: 'horsepower',
      data: rpmData
    });

    this.torqueHeatmap = new App.Heatmap({
      $el: this.$el.find('.torque-heatmap-canvas'),
      mode: 'torque',
      data: rpmData
    });

    // 2d graphs
    this.styleGraph = new App.StyleGraph({
      $el: this.$el.find('.style-2d-graph-svg'),
      data: accelData
    });

    this.efficiencyGraph = new App.EfficiencyGraph({
      $el: this.$el.find('.efficiency-2d-graph-svg'),
      data: accelData
    });

    this.powerGraph = new App.PowerGraph({
      $el: this.$el.find('.power-2d-graph-svg'),
      data: rpmData
    });

    // insights
    this.$el.find('.persona').text(args.data.persona ? args.data.persona : 'unknown');
    this.$el.find('.optimal-efficiency').text(this.efficiencyGraph.optimalSpeed);
    this.$el.find('.optimal-power').text(this.powerGraph.optimalRpm);

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
