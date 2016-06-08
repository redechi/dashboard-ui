(function() {

  // ----------
  window.App = {
    data: null,
    milesPerKilometer: 0.621371,
    kilometersPerMile: 1.60934,

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

      var queryParams = getQueryParams(document.location.search);

      if (queryParams.demo) {
        self.getDemoData();
      } else {
        showLoading();
        if (queryParams.share) {
          getShareData(queryParams.share, function(e, result) {
            hideLoading();
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
      if (this.personResultsView) {
        this.personResultsView.destroy();
      }

      var vehicle = this.currentVehicle();

      this.personResultsView = new App.ResultsView({
        name: 'your ' + vehicle.year + ' ' + vehicle.make + ' ' + vehicle.model,
        $container: $('.results'),
        data: this.data
      });
    },

    // ----------
    renderGroupData: function(data) {
      if (this.groupResultsView) {
        this.groupResultsView.destroy();
      }

      this.groupResultsView = new App.ResultsView({
        name: 'All ' + this.groupName,
        $container: $('.results'),
        data: data
      });
    },

    // ----------
    clearData: function() {
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
          self.data = result;
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

      if (this.groupResultsView) {
        this.groupResultsView.destroy();
      }

      this.request({
        path: 'group-heatmap/',
        method: 'POST',
        data: {
          options: options
        },
        success: function(result) {
          self.renderGroupData(result);
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
        self._vehicles = results;

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
      return _.findWhere(this._vehicles, {
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
        self.data = rawData;
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
