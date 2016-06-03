(function() {

  // ----------
  window.App = {
    data: null,

    // ----------
    init: function() {
      var self = this;

      $('#vehicleChoice').on('change', function() {
        $('.graphs').fadeOut();
        self.getVehicleData();
      });

      formatForDemo();
      showLoginLink('car-behavior');

      var queryParams = getQueryParams(document.location.search);

      if (queryParams.demo) {
        self.getDemoData();
      } else {
        showLoading();
        if (queryParams.share) {
          getShareData(queryParams.share, function(e, result) {
            if (e) {
              return alert(e);
            }
            self.data = result;
            self.renderData();
          });
        } else {
          self.getUserData();
        }
      }
    },

    // ----------
    renderData: function() {
      $('.graphs').fadeIn();
      $('.error').hide();

      hideLoading();

      // data
      var accelData = new App.HeatmapData({
        rawData: this.data,
        x: 'vel_bin',
        y: 'accel_bin'
      });

      var rpmData = new App.HeatmapData({
        rawData: this.data,
        x: 'vel_bin',
        y: 'rpm_bin'
      });

      // heatmaps
      this.styleHeatmap = new App.Heatmap({
        $el: $('.style-heatmap-canvas'),
        mode: 'style',
        data: accelData
      });

      this.efficiencyHeatmap = new App.Heatmap({
        $el: $('.efficiency-heatmap-canvas'),
        mode: 'efficiency',
        data: accelData
      });

      this.horsepowerHeatmap = new App.Heatmap({
        $el: $('.horsepower-heatmap-canvas'),
        mode: 'horsepower',
        data: rpmData
      });

      this.torqueHeatmap = new App.Heatmap({
        $el: $('.torque-heatmap-canvas'),
        mode: 'torque',
        data: rpmData
      });

      // 2d graphs
      this.styleGraph = new App.StyleGraph({
        $el: $('.style-2d-graph-canvas'),
        data: accelData
      });

      this.efficiencyGraph = new App.EfficiencyGraph({
        $el: $('.efficiency-2d-graph-canvas'),
        data: accelData
      });

      this.powerGraph = new App.PowerGraph({
        $el: $('.power-2d-graph-canvas'),
        data: rpmData
      });

      // insights
      $('.persona').text(this.data.persona ? this.data.persona : 'unknown');
      $('.optimal-efficiency').text(this.efficiencyGraph.optimalSpeed);
      $('.optimal-power').text(this.powerGraph.optimalRpm);
    },

    // ----------
    clearData: function() {
    },

    // ----------
    getVehicleData: function() {
      var self = this;
      var accessToken = getAccessToken();

      var isStaging = window.location.search.indexOf('staging') !== -1; // in case we need to know this in the future
      var apiUrl = 'https://moxie.automatic.com/vehicle-heatmap/';

      showLoading();

      $.ajax({
        url: apiUrl,
        data: {
          vehicle_id: $('#vehicleChoice').val()
        },
        headers: {
          Authorization: 'bearer ' + accessToken
        }
      })
      .done(function(result) {
        self.data = result;
        self.renderData();
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.error(errorThrown);

        hideLoading();
        $('.graphs').hide();
        $('.error').show();
      });
    },

    // ----------
    getUserData: function() {
      var self = this;

      showLoading();

      fetchVehicles(function(results) {
        if (results.length === 0) {
          $('.error').show();
        } else {
          $('.controls').show();

          _.sortBy(results, 'make').forEach(function(vehicle) {
            var vehicleName = vehicle.year + ' ' + vehicle.make + ' ' + vehicle.model;
            $('#vehicleChoice').append('<option value="' + vehicle.id + '">' + vehicleName  + '</option>');
          });

          self.getVehicleData();
        }
      });
    },

    // ----------
    getDemoData: function() {
      var self = this;

      $.getJSON('/labs/car-behavior/data/driver-heatmaps.json', function(rawData) {
        self.data = rawData;
        self.renderData();
      });
    }
  };

  // ----------
  $(document).ready(function() {
    App.init();
  });

})();
