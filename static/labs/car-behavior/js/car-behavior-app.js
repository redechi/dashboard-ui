(function() {

  // ----------
  window.App = {
    leftData: null,
    rightData: null,
    milesPerKilometer: 0.621371,
    kilometersPerMile: 1.60934,
    minKph: 0,
    maxKph: 160,
    minMph: 0,
    maxMph: 100,
    minRpm: 1000,
    maxRpm: 8000,
    minAccel: -22,
    maxAccel: 21,

    // ----------
    init: function() {
      var self = this;

      this.modes = {};

      var modeMap = {
        style: {
          name: 'Driving Style',
          explanation: 'This page shows how your driving style compares with your peers and how aggressive you are.',
          prompt: 'Compare your driving style with another vehicle:',
          comparisonText: 'By analyzing the velocities and accelerations where you spend your time, we’re able to identify which drivers are more aggressive than others.  Instead of just looking at hard braking and acceleration events, we looked at all accelerations and brakes to develop an overall driving style for a user in these four categories.'
        },
        efficiency: {
          name: 'Efficiency',
          explanation: 'This page shows how your vehicle’s fuel efficiency compares with other vehicles and how to drive to achieve the best MPG.',
          prompt: 'Compare your vehicle’s fuel efficiency with another vehicle:',
          comparisonText: 'We took the driving of the average American and pretended this person drove your car over many drives.  Using your car’s fuel efficiency heatmap, we calculated the total gallons of fuel and that would have been used over these drive simulations to show MPG comparisons in the city, highway, and overall.'
        },
        power: {
          name: 'Power',
          explanation: 'This page shows how your vehicle’s power and torque compares with other vehicles.',
          prompt: 'Compare your vehicle’s power with another vehicle:',
          comparisonText: ''
        }
      };

      _.each(modeMap, function(v, k) {
        var mode = new App.Mode(_.extend({
          key: k,
        }, v));

        self.modes[k] = mode;
      });

      this.leftMenu = new App.VehicleMenu({
        $el: $('#vehicleChoice'),
        onSelect: function() {
          var optionView = self.leftMenu.selectedOptionView();
          if (optionView.key === 'extra') {
            self.updateLeftMenu();
            self.getGroupData('left');
          } else {
            sessionStorage.setItem('labs_car_behavior_vehicle_id', optionView.key);
            $('.graphs').fadeOut();
            self.getVehicleData();
          }

          if (self.personResultsView) {
            self.personResultsView.destroy();
            self.personResultsView = null;
          }

          $('.controls .your').toggle(optionView.key !== 'extra');
        }
      });

      this.rightMenu = new App.VehicleMenu({
        $el: $('.group-select'),
        onSelect: function() {
          if (self.rightMenu.selectedOptionView().key === 'extra') {
            self.updateRightMenu();
          }

          self.getGroupData('right');
        }
      });

      formatForDemo();
      showLoginLink('car-behavior');

      this.$tabs = $('.tab').on('click', function() {
        var $el = $(this);
        self.selectMode($el.data('mode'));
      });

      var modeKey = 'efficiency';
      var hash = location.hash.replace(/^#/, '');
      this.removeHash();
      if (_.contains(_.keys(this.modes), hash)) {
        modeKey = hash;
      }

      this.selectMode(modeKey);

      var queryParams = getQueryParams(document.location.search);
      if (queryParams.demo) {
        this.getDemoData();
      } else {
        showLoading();
        this.getUserData();
      }

      this._loadVehiclePickerData();

      $(window).on('resize', function() {
        if (self.personResultsView) {
          self.personResultsView.resize();
        }
      });
    },

    // ----------
    renderData: function() {
      if (this.personResultsView) {
        this.personResultsView.destroy();
      }

      if (!this.leftData) {
        return;
      }

      this.personResultsView = new App.ResultsView({
        mode: this.mode.key,
        $container: $('.results'),
        leftData: this.leftData,
        rightData: this.rightData,
        leftOptionView: this.leftMenu.selectedOptionView(),
        rightOptionView: this.rightMenu.selectedOptionView()
      });
    },

    // ----------
    selectMode: function(modeKey) {
      this.mode = this.modes[modeKey];
      this.mode.select();
      this.renderData();
    },

    // ----------
    getVehicleData: function() {
      var self = this;

      _.each(this.modes, function(mode) {
        mode.clearComparison();
      });

      var optionView = this.leftMenu.selectedOptionView();

      this.request({
        path: 'vehicle-heatmap/',
        data: {
          vehicle_id: optionView.key
        },
        success: function(result) {
          self.leftData = self._digestData(result);
          self.renderData();

          self.updateRightMenu();
          self.getGroupData('right');
        },
        error: function(errorThrown) {
          $('.error').text('Unable to load data for this vehicle.');
        }
      });
    },

    // ----------
    _digestData: function(raw, type) {
      var mafCountThreshold = (type === 'group' ? 50 : 10);

      return {
        raw: raw,
        accel: new App.HeatmapData({
          mafCountThreshold: mafCountThreshold,
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
    _loadVehiclePickerData: function() {
      this._vehiclePickerPromise = this.request({
        path: 'vehicle-picker/?option=toplevel'
      });
    },

    // ----------
    getVehiclePickerData: function(callback) {
      this._vehiclePickerPromise.done(callback);
    },

    // ----------
    getGroupData: function(side) {
      var self = this;

      console.assert(side === 'left' || side === 'right', 'valid side');

      _.each(this.modes, function(mode) {
        mode.clearComparison();
      });

      var menu = (side === 'left' ? this.leftMenu : this.rightMenu);
      var dataKey = (side === 'left' ? 'leftData' : 'rightData');
      var optionView = menu.selectedOptionView();

      this[dataKey] = null;
      this.renderData();

      this.request({
        path: 'group-heatmap/',
        method: 'POST',
        data: {
          options: optionView.options
        },
        success: function(result) {
          self[dataKey] = self._digestData(result, 'group');
          self.renderData();
          self.getComparisons();
        },
        error: function(errorThrown) {
          $('.error').text('Unable to load data for ' + optionView.name + '.');
        }
      });
    },

    // ----------
    getComparisons: function() {
      var self = this;

      if (!this.leftData || !this.rightData) {
        return;
      }

      _.each(this.modes, function(mode) {
        if (mode.key === 'power') {
          return;
        }

        mode.getComparison({
          leftData: self.leftData,
          rightData: self.rightData,
          leftOptionView: self.leftMenu.selectedOptionView(),
          rightOptionView: self.rightMenu.selectedOptionView()
        });
      });
    },

    // ----------
    request: function(args) {
      $('.error').text('');
      showLoading();

      var accessToken = getAccessToken();
      var isStaging = window.location.search.indexOf('staging') !== -1; // in case we need to know this in the future
      var apiUrl = 'https://moxie.automatic.com/' + args.path;

      return $.ajax({
        url: apiUrl,
        method: args.method,
        contentType: args.contentType,
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
        self.vehicles = _.sortBy(results, 'make');

        if (results.length === 0) {
          $('.error').text('You don\'t appear to have any vehicles.');
        } else {
          $('.controls').show();

          self.updateLeftMenu();

          var vehicleId = sessionStorage.getItem('labs_car_behavior_vehicle_id');
          if (vehicleId) {
            var vehicle = _.findWhere(self.vehicles, {
              id: vehicleId
            });

            if (vehicle) {
              self.leftMenu.select(vehicleId);
            }
          }

          self.getVehicleData();
        }
      });
    },

    // ----------
    currentVehicle: function() {
      var optionView = this.leftMenu.selectedOptionView();
      return _.findWhere(this.vehicles, {
        id: optionView.key
      });
    },

    // ----------
    leftVehicleName: function() {
      var optionView = this.leftMenu.selectedOptionView();
      return optionView.name || '';
    },

    // ----------
    rightVehicleName: function() {
      var optionView = this.rightMenu.selectedOptionView();
      return optionView.name || '';
    },

    // ----------
    updateLeftMenu: function() {
      var self = this;

      var optionSets = [];

      _.each(this.vehicles, function(vehicle) {
        optionSets.push({
          name: vehicle.year + ' ' + vehicle.make + ' ' + vehicle.model,
          vehicleId: vehicle.id
        });
      });

      this.leftMenu.update(optionSets);
    },

    // ----------
    updateRightMenu: function() {
      var self = this;

      var optionSets = [];

      if (this.leftData) {
        var data = this.leftData.raw;

        if (data.make) {
          if (data.model) {
            optionSets.push({
              make: data.make,
              model: data.model
            });
          }

          optionSets.push({
            make: data.make
          });
        }

        if (data.price) {
          optionSets.push({
            price: data.price
          });
        }

        if (data.horsepower) {
          optionSets.push({
            horsepower: data.horsepower
          });
        }

        if (data.eng_size) {
          optionSets.push({
            eng_size: data.eng_size
          });
        }

        if (data.city) {
          optionSets.push({
            city: data.city
          });
        }

        if (data.state) {
          optionSets.push({
            state: data.state
          });
        }

        if (data.region) {
          optionSets.push({
            region: data.region
          });
        }
      }

      this.rightMenu.update(optionSets);
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
    removeHash: function() {
      if ('replaceState' in history) {
          history.replaceState('', document.title, location.pathname + location.search);
      } else {
          location.hash = '';
      }
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
