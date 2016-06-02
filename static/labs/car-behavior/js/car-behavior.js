(function() {

  // ----------
  window.App = {
    // ----------
    init: function() {
      var self = this;

      $.getJSON('/labs/car-behavior/data/driver-heatmaps.json', function(rawData) {
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

        self.styleHeatmap = new App.Heatmap({
          $el: $('.driving-style-heatmap-canvas'),
          mode: 'style',
          data: accelData
        });

        self.efficiencyHeatmap = new App.Heatmap({
          $el: $('.fuel-efficiency-heatmap-canvas'),
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
      });
    }
  };

  // ----------
  $(document).ready(function() {
    App.init();
  });

})();
