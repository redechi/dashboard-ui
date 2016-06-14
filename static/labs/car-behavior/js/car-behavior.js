(function() {

  // ----------
  window.App = {
    singleData: null,
    groupData: null,
    milesPerKilometer: 0.621371,
    kilometersPerMile: 1.60934,

    modes: {
      style: {
        explanation: 'This page shows how your driving style compares with your peers and how aggressive you are.'
      },
      efficiency: {
        explanation: 'This page shows how your vehicle’s fuel efficiency compares with other vehicles and how to drive to achieve the best MPG.'
      },
      power: {
        explanation: 'This page shows how your vehicle’s power compares with other vehicles and how fun each vehicle is to drive.'
      }
    },

    // ----------
    init: function() {
      var self = this;

      $('#vehicleChoice').on('change', function() {
        $('.graphs').fadeOut();
        self.getVehicleData();
      });

      this.$groupSelect = $('.group-select')
        .on('change', function() {
          if (self.$groupSelect.val() === 'other') {
            self.vehiclePickerModal.show({
              onComplete: function(results) {
                self.getGroupData(results);
              }
            });
          }
        });

      formatForDemo();
      showLoginLink('car-behavior');

      this.$tabs = $('.tab').on('click', function() {
        var $el = $(this);
        self.selectMode($el.data('mode'));
      });

      this.selectMode('style');

      var queryParams = getQueryParams(document.location.search);
      if (queryParams.demo) {
        this.getDemoData();
      } else {
        showLoading();
        if (queryParams.share) {
          getShareData(queryParams.share, function(e, result) {
            hideLoading();
            if (e) {
              return alert(e);
            }
            self.singleData = self._digestData(result);
            self.renderData();
          });
        } else {
          this.getUserData();
        }
      }
    },

    // ----------
    renderData: function() {
      if (this.personResultsView) {
        this.personResultsView.destroy();
      }

      if (!this.singleData) {
        return;
      }

      var vehicle = this.currentVehicle();

      this.personResultsView = new App.ResultsView({
        mode: this._mode,
        name: 'your ' + vehicle.year + ' ' + vehicle.make + ' ' + vehicle.model,
        $container: $('.results'),
        singleData: this.singleData,
        groupData: this.groupData
      });
    },

    // ----------
    selectMode: function(mode) {
      this._mode = mode;
      $('.tab').removeClass('selected');
      $('.tab[data-mode=' + mode + ']').addClass('selected');
      $('.explanation').text(this.modes[this._mode].explanation);
      this.renderData();
    },

    // ----------
    getVehicleData: function() {
      var self = this;

      this.request({
        path: 'vehicle-heatmap/',
        data: {
          vehicle_id: $('#vehicleChoice').val()
        },
        success: function(result) {
          self.singleData = self._digestData(result);
          self.renderData();
          self.getGroupData({
            make: result.make,
            model: result.model
          });
        },
        error: function(errorThrown) {
          $('.error').text('Unable to load data for this vehicle.');
        }
      });
    },

    // ----------
    _digestData: function(raw) {
      return {
        raw: raw,
        accel: new App.HeatmapData({
          rawData: raw,
          x: 'vel_bin',
          y: 'accel_bin'
        }),
        rpm: new App.HeatmapData({
          rawData: raw,
          x: 'vel_bin',
          y: 'rpm_bin'
        })
      };
    },

    // ----------
    getVehiclePicker: function() {
      // TODO: use this data for a vehicle picker
      this.request({
        path: 'vehicle-picker/?option=price'
      });
    },

    // ----------
    getGroupData: function(options) {
      var self = this;

      var parts = [];
      var needsVehicles = true;

      if (options.price) {
        parts.push('$' + options.price);
      }

      if (options.engsize) {
        parts.push(options.engsize);
      }

      if (options.horsepower) {
        parts.push(options.horsepower + ' HP');
      }

      if (options.make) {
        parts.push(options.make);
        needsVehicles = false;
      }

      if (options.model) {
        parts.push(options.model);
        needsVehicles = false;
      }

      if (needsVehicles) {
        parts.push('Vehicles');
      } else {
        parts[parts.length - 1] += 's';
      }

      this.groupName = parts.join(' ');
      this.updateGroupSelect();

      this.groupData = null;
      this.renderData();

      this.request({
        path: 'group-heatmap/',
        method: 'POST',
        data: {
          options: options
        },
        success: function(result) {
          self.groupData = self._digestData(result);
          self.renderData();
        },
        error: function(errorThrown) {
          $('.error').text('Unable to load data for ' + self.groupName + '.');
        }
      });
    },

    // ----------
    request: function(args) {
      $('.error').text('');
      showLoading();

      var accessToken = getAccessToken();
      var isStaging = window.location.search.indexOf('staging') !== -1; // in case we need to know this in the future
      var apiUrl = 'https://moxie.automatic.com/' + args.path;

      $.ajax({
        url: apiUrl,
        method: args.method,
        data: args.data,
        headers: {
          Authorization: 'bearer ' + accessToken
        }
      })
      .done(function(result) {
        hideLoading();
        if (args.success) {
          args.success(result);
        }
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        hideLoading();
        console.error(errorThrown);
        if (args.error) {
          args.error(errorThrown);
        }
      });
    },

    // ----------
    getUserData: function() {
      var self = this;

      showLoading();

      fetchVehicles(function(results) {
        self.vehicles = results;

        if (results.length === 0) {
          $('.error').text('You don\'t appear to have any vehicles.');
        } else {
          $('.controls').show();

          _.sortBy(results, 'make').forEach(function(vehicle) {
            var vehicleName = vehicle.year + ' ' + vehicle.make + ' ' + vehicle.model;
            $('#vehicleChoice').append('<option value="' + vehicle.id + '">' + vehicleName  + '</option>');
          });

          self.getVehicleData();
          // self.getVehiclePicker();
        }
      });
    },

    // ----------
    currentVehicle: function() {
      var id = $('#vehicleChoice').val();
      return _.findWhere(this.vehicles, {
        id: id
      });
    },

    // ----------
    updateGroupSelect: function() {
      this.$groupSelect.empty();

      var vehicle = this.currentVehicle();

      $('<option value="">All ' + this.groupName + '</option>')
        .appendTo(this.$groupSelect);

      $('<option value="other">Other Vehicles...</option>')
        .appendTo(this.$groupSelect);
    },

    // ----------
    getDemoData: function() {
      var self = this;

      $.getJSON('/labs/car-behavior/data/driver-heatmaps.json', function(rawData) {
        self.data = self._digestData(rawData);
        self.renderData();
      });
    },

    // ----------
    template: function(name, config) {
      var rawTemplate = $('#' + name + '-template').text();
      var template = _.template(rawTemplate);
      var html = template(config);
      return $(html);
    }
  };

  // ----------
  $(document).ready(function() {
    App.init();
  });

})();
