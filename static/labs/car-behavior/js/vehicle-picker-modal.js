(function() {

  // ----------
  App.vehiclePickerModal = {
    // ----------
    _init: function(callback) {
      var self = this;

      if (this._initialized) {
        callback();
        return;
      }

      this.$el = $('.modal')
        .on('click', function() {
          self.hide();
          self._onCancel();
        });

      this.$el.find('.modal-dialog')
        .on('click', function(event) {
          event.stopPropagation();
        });

      this.$content = this.$el.find('.modal-content');

      this.$el.find('.close')
        .on('click', function() {
          self.hide();
          self._onCancel();
        });

      this.$el.on('change', 'select', function(event) {
        self._makeResults();
        self._render();
      });

      self._initialized = true;

      App.getVehiclePickerData(function(data) {
        self._data = data;
        callback();
      });
    },

    // ----------
    show: function(args) {
      var self = this;

      this._onComplete = args.onComplete;
      this._onCancel = args.onCancel;
      this._results = {};

      this._init(function() {
        self.$el.fadeIn();
        self._render();
      });
    },

    // ----------
    hide: function() {
      this.$el.fadeOut();
    },

    // ----------
    _makeResults: function() {
      var results = {};
      this.$selects.each(function(i, v) {
        var $select = $(v);
        var key = $select.data('key');
        var value = $select.val();
        if (value !== '---') {
          results[key] = value;
        }
      });

      this._results = results;
    },

    // ----------
    _render: function() {
      var self = this;

      var names = {
        horsepower: 'Horsepower',
        engsize: 'Engine Size',
        make: 'Make',
        price: 'Price',
        city: 'City',
        state: 'State',
        region: 'Region',
        bodytype: 'Body Type',
        gen: 'Generation',
        model: 'Model'
      };

      var locationKeys = [
        'city',
        'state',
        'region'
      ];

      var selects = {};
      var hasLocation = false;

      var addSelects = function(data) {
        _.each(data, function(v, k) {
          var options;
          if (_.isString(v)) {
            options = [v];
          } else if (_.isArray(v)) {
            options = _.clone(v);
          } else if (_.isObject(v)) {
            options = _.keys(v);
          } else {
            return;
          }

          var select = {
            key: k,
            name: names[k] || k,
            options: options,
            isLocation: _.contains(locationKeys, k)
          };

          if (selects[k]) {
            selects[k].options = _.intersection(selects[k].options, select.options);
          } else {
            selects[k] = select;
          }

          if (self._results[k]) {
            select.selected = self._results[k];
            if (_.isObject(v)) {
              addSelects(v[select.selected]);
            }
          }
        });
      };

      addSelects(this._data);

      selects = _.values(selects);

      selects = _.filter(selects, function(select) {
        return select.options.length > 0;
      });

      _.each(selects, function(select) {
        if (select.selected && !_.contains(select.options, select.selected)) {
          delete select.selected;
        }

        if (select.selected && select.isLocation) {
          hasLocation = true;
        }

        select.options = select.options.sort(function(a, b) {
          // we want the "greater than" character to sort at the bottom
          a = a.replace(/^>/, 'z');
          b = b.replace(/^>/, 'z');
          return a.localeCompare(b);
        });

        select.options.unshift('---');
      });

      selects = _.filter(selects, function(select) {
        var isExtraLocation = select.isLocation && hasLocation && !select.selected;
        return !isExtraLocation;
      });

      this.$content.empty();

      App.template('vehicle-picker', {
        selects: selects
      }).appendTo(this.$content);

      this.$button = this.$el.find('.btn-select');
      this.$selects = this.$el.find('select');

      var found = _.keys(self._results).length > 0;
      self.$button.toggleClass('btn-disabled', !found);

      this.$button.on('click', function() {
        if (!self.$button.hasClass('btn-disabled')) {
          self.hide();
          self._onComplete(self._results);
        }
      });
    }
  };

})();
