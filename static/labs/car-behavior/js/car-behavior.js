(function() {

  // ----------
  window.App = {
    singleData: null,
    groupData: null,
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

    modes: {
      style: {
        explanation: 'This page shows how your driving style compares with your peers and how aggressive you are.',
        prompt: 'Compare your driving style with another vehicle:'
      },
      efficiency: {
        explanation: 'This page shows how your vehicle’s fuel efficiency compares with other vehicles and how to drive to achieve the best MPG.',
        prompt: 'Compare your vehicle’s fuel efficiency with another vehicle:'
      },
      power: {
        explanation: 'This page shows how your vehicle’s power compares with other vehicles and how fun each vehicle is to drive.',
        prompt: 'Compare your vehicle’s power with another vehicle:'
      }
    },

    // ----------
    init: function() {
      var self = this;

      $('#vehicleChoice').on('change', function() {
        var vehicleId = $('#vehicleChoice').val();
        sessionStorage.setItem('labs_car_behavior_vehicle_id', vehicleId);
        $('.graphs').fadeOut();
        self.getVehicleData();
      });

      this.$groupSelect = $('.group-select')
        .on('change', function() {
          var groupOptionView = _.findWhere(self._groupOptionViews, {
            key: self.$groupSelect.val()
          });

          if (groupOptionView.options.other) {
            self.vehiclePickerModal.show({
              onComplete: function(results) {
                self._extraGroupOptions = results;
                self._selectedGroupOptionViewKey = 'extra';
                self.updateGroupSelect();
                self.getGroupData();
              },
              onCancel: function() {
                self.updateGroupSelect();
              }
            });
          } else {
            self._selectedGroupOptionViewKey = groupOptionView.key;
            self.getGroupData();
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
        this.getUserData();
      }

      this._loadVehiclePickerData();
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
      $('.prompt').text(this.modes[this._mode].prompt);
      this.renderData();

      var $faq = $('.faq').empty();
      this.template('faq', {
        mode: this._mode
      }).appendTo($faq);

      $('.question').on('click', '.open-control, h3', function() {
        var questionDiv = $(this).parents('.question');
        questionDiv.toggleClass('open');
        $('.answer', questionDiv).slideToggle();
        $('.open-control', questionDiv).toggleClass('fa-chevron-down');
        $('.open-control', questionDiv).toggleClass('fa-chevron-up');
      });
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

          self.updateGroupSelect();
          self.getGroupData();
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
    getGroupData: function() {
      var self = this;

      var groupOptionView = _.findWhere(this._groupOptionViews, {
        key: this._selectedGroupOptionViewKey
      });

      this.groupData = null;
      this.renderData();

      this.request({
        path: 'group-heatmap/',
        method: 'POST',
        data: {
          options: groupOptionView.options
        },
        success: function(result) {
          self.groupData = self._digestData(result, 'group');
          self.renderData();
          self.getComparison();
        },
        error: function(errorThrown) {
          $('.error').text('Unable to load data for ' + groupOptionView.name + '.');
        }
      });
    },

    // ----------
    getComparison: function() {
      var self = this;

      if (!this.singleData || !this.groupData) {
        return;
      }

      var type = this._mode;

      var dataKey = 'accel';
      if (this._mode === 'power') {
        dataKey = 'rpm';
      }

      var dataMode = this._mode;
      if (dataMode === 'power') {
        dataMode = 'horsepower';
      }

      var h1 = this.singleData[dataKey].getForComparison(dataMode);
      var h2 = this.groupData[dataKey].getForComparison(dataMode);

      this.request({
        path: 'compare-heatmaps/',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          type: type,
          h1: h1,
          h2: h2
        }),
        success: function(result) {
          // TODO: display the comparison
        },
        error: function(errorThrown) {
          $('.error').text('Unable to load comparison.');
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
        self.vehicles = results;

        if (results.length === 0) {
          $('.error').text('You don\'t appear to have any vehicles.');
        } else {
          $('.controls').show();

          _.sortBy(results, 'make').forEach(function(vehicle) {
            var vehicleName = vehicle.year + ' ' + vehicle.make + ' ' + vehicle.model;
            $('#vehicleChoice').append('<option value="' + vehicle.id + '">' + vehicleName  + '</option>');
          });

          var vehicleId = sessionStorage.getItem('labs_car_behavior_vehicle_id');
          if (vehicleId) {
            var vehicle = _.findWhere(self.vehicles, {
              id: vehicleId
            });

            if (vehicle) {
              $('#vehicleChoice').val(vehicleId);
            }
          }

          self.getVehicleData();
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
      var self = this;

      var optionSets = [];
      this.$groupSelect.empty();

      if (!this.singleData) {
        return;
      }

      var data = this.singleData.raw;

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

      if (this._extraGroupOptions) {
        optionSets.push(_.extend({
          extra: true
        }, this._extraGroupOptions));
      }

      optionSets.push({
        other: true
      });

      this._groupOptionViews = _.map(optionSets, function(v, i) {
        var key = _.keys(v).join('-');
        if (v.extra) {
          key = 'extra';
          delete v.extra;
        }

        var output = {
          key: key,
          name: v.other ? 'Other Vehicles...' : 'All ' + self._groupName(v),
          options: v
        };

        output.$el = $('<option value="' + output.key + '">' + output.name + '</option>')
          .appendTo(self.$groupSelect);

        return output;
      });

      if (!this._selectedGroupOptionViewKey) {
        this._selectedGroupOptionViewKey = this._groupOptionViews[0].key;
      }

      var groupOptionView = _.findWhere(this._groupOptionViews, {
        key: this._selectedGroupOptionViewKey
      });

      groupOptionView.$el.prop({
        selected: 'selected'
      });
    },

    // ----------
    _groupName: function(options) {
      var parts = [];
      var needsVehicles = true;

      if (options.price) {
        parts.push('$' + options.price);
      }

      if (options.eng_size) {
        parts.push(options.eng_size);
      }

      if (options.horsepower) {
        parts.push(options.horsepower + ' HP');
      }

      if (options.gen) {
        parts.push(options.gen);
      }

      if (options.make) {
        parts.push(options.make);
        needsVehicles = false;
      }

      if (options.model) {
        parts.push(options.model);
        needsVehicles = false;
      }

      if (options.bodytype) {
        parts.push(options.bodytype);
        needsVehicles = false;
      }

      if (needsVehicles) {
        parts.push('Vehicles');
      } else {
        var index = parts.length - 1;
        var name = parts[index];
        if (/[sz]$/i.test(name)) {
          name += 'es';
        } else if (/y$/i.test(name)) {
          name = name.replace(/y$/i, 'ies');
        } else {
          name += 's';
        }

        parts[index] = name;
      }

      var locations = [];
      if (options.city) {
        locations.push(options.city);
      }

      if (options.state) {
        locations.push(options.state);
      }

      if (options.region) {
        locations.push(options.region);
      }

      if (locations.length) {
        parts.push(' in ' + locations.join(', '));
      }

      return parts.join(' ');
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
