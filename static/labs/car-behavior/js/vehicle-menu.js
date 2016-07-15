(function() {

  // ----------
  var component = App.VehicleMenu = function(args) {
    var self = this;

    this.$el = args.$el;
    this._onSelect = args.onSelect;

    this.$el
      .on('change', function() {
        var optionView = _.findWhere(self._optionViews, {
          key: self.$el.val()
        });

        if (optionView.options.other) {
          App.vehiclePickerModal.show({
            onComplete: function(results) {
              self._extraOptions = results;
              self._selectedOptionViewKey = 'extra';
              self._onSelect();
            },
            onCancel: function() {
              self._updateSelection();
            }
          });
        } else {
          self._selectedOptionViewKey = optionView.key;
          self._onSelect();
        }
      });
  };

  // ----------
  component.prototype = {
    // ----------
    selectedOptionView: function() {
      var optionView = _.findWhere(this._optionViews, {
        key: this._selectedOptionViewKey
      });

      return optionView || {
        key: this._selectedOptionViewKey
      };
    },

    // ----------
    extraOptions: function() {
      return this._extraOptions;
    },

    // ----------
    select: function(key) {
      this._selectedOptionViewKey = key;
      this._updateSelection();
    },

    // ----------
    update: function(optionSets) {
      var self = this;

      this.$el.empty();

      if (this._extraOptions) {
        optionSets.push(_.extend({
          extra: true
        }, this._extraOptions));
      }

      if (!App.isDemo) {
        optionSets.push({
          other: true
        });
      }

      this._optionViews = _.map(optionSets, function(v, i) {
        var key;
        if (v.vehicleId) {
          key = v.vehicleId;
        } else {
          key = _.keys(v).join('-');
        }

        if (v.extra) {
          key = 'extra';
          delete v.extra;
        }

        var output = {
          key: key,
          name: v.name ? v.name : (v.other ? 'Other Vehicles...' : 'All ' + self._groupName(v)),
          options: v
        };

        output.$el = $('<option value="' + output.key + '">' + output.name + '</option>')
          .appendTo(self.$el);

        return output;
      });

      this._updateSelection();
    },

    // ----------
    _updateSelection: function() {
      if (!this._selectedOptionViewKey) {
        this._selectedOptionViewKey = this._optionViews[0].key;
      }

      var optionView = this.selectedOptionView();

      optionView.$el.prop({
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
          if (!/(series|pickups|vans)$/i.test(name)) {
            name += 'es';
          }
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
    }
  };

})();
