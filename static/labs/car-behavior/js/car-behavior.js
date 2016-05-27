(function() {

  // ----------
  window.App = {
    // ----------
    init: function() {
      var self = this;

      $.ajax({
        url: 'data/driver-heatmaps.json',
        success: function(data) {
          self.heatmap = new App.Heatmap({
            $el: $('.heatmap-canvas'),
            data: data
          });
        }
      });
    }
  };

  // ----------
  $(document).ready(function() {
    App.init();
  });

})();
