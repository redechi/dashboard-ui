(function() {

  // ----------
  window.App = {
    // ----------
    init: function() {
      var self = this;

      $.getJSON('/labs/car-behavior/data/driver-heatmaps.json', function(rawData) {
        // data
        var accelData = new App.HeatmapData({
          rawData: rawData,
          x: 'vel_bin',
          y: 'accel_bin'
        });

        var rpmData = new App.HeatmapData({
          rawData: rawData,
          x: 'vel_bin',
          y: 'rpm_bin'
        });

        // heatmaps
        self.styleHeatmap = new App.Heatmap({
          $el: $('.style-heatmap-canvas'),
          mode: 'style',
          data: accelData
        });

        self.efficiencyHeatmap = new App.Heatmap({
          $el: $('.efficiency-heatmap-canvas'),
          mode: 'efficiency',
          data: accelData
        });

        self.horsepowerHeatmap = new App.Heatmap({
          $el: $('.horsepower-heatmap-canvas'),
          mode: 'horsepower',
          data: rpmData
        });

        self.torqueHeatmap = new App.Heatmap({
          $el: $('.torque-heatmap-canvas'),
          mode: 'torque',
          data: rpmData
        });

        // 2d graphs
        self.styleGraph = new App.StyleGraph({
          $el: $('.style-2d-graph-canvas'),
          data: accelData
        });

        self.efficiencyGraph = new App.EfficiencyGraph({
          $el: $('.efficiency-2d-graph-canvas'),
          data: accelData
        });

        self.powerGraph = new App.PowerGraph({
          $el: $('.power-2d-graph-canvas'),
          data: rpmData
        });

        // insights
        $('.persona').text(rawData.persona);
        $('.optimal-efficiency').text(self.efficiencyGraph.optimalSpeed);


// Algorithm to calculate Optimal RPM for Horsepower / Torque
// Using the 2D HP/Torque vs RPM graph, starting from 0-500 rpm in intervals of 250 (250-750, 500-1000, etc), find the range with the maximum average horsepower/torque.
// *we’ll also tell users to check out the 3D graph to determine the optimal speed + gear if they want to manually figure that out from the picture

      });
    }
  };

  // ----------
  $(document).ready(function() {
    App.init();
  });

})();
