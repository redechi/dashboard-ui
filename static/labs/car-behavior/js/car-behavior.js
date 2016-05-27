(function() {

  // ----------
  window.App = {
    // ----------
    init: function() {
      var self = this;

      $.getJSON('/labs/car-behavior/data/driver-heatmaps.json', function(data) {
        self.styleHeatmap = new App.Heatmap({
          $el: $('.driving-style-heatmap-canvas'),
          mode: 'style',
          data: data
        });

        self.efficiencyHeatmap = new App.Heatmap({
          $el: $('.fuel-efficiency-heatmap-canvas'),
          mode: 'efficiency',
          data: data
        });
      });
    }
  };

  // ----------
  $(document).ready(function() {
    App.init();
  });

})();
