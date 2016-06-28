(function() {

  // ----------
  App.vehiclePickerModal = {
    _sections: [
      {
        name: 'Vehicle',
        selectedRowIndex: 0,
        rows: [
          {
            menus: [
              {
                key: 'make'
              },
              {
                key: 'model'
              },
              {
                key: 'gen'
              }
            ]
          },
          {
            menus: [
              {
                key: 'price'
              },
              {
                key: 'bodytype'
              }
            ]
          },
          {
            menus: [
              {
                key: 'horsepower'
              }
            ]
          },
          {
            menus: [
              {
                key: 'eng_size'
              }
            ]
          }
        ]
      },
      {
        name: 'Location',
        selectedRowIndex: 0,
        note: 'Only locations with a significant amount data for each vehicle are shown.',
        rows: [
          {
            name: 'All'
          },
          {
            menus: [
              {
                key: 'region'
              }
            ]
          },
          {
            menus: [
              {
                key: 'state'
              }
            ]
          },
          {
            menus: [
              {
                key: 'city'
              }
            ]
          }
        ]
      },
    ],

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
        self._handleChange($(this));
      });

      this.$el.on('change', 'input[type=radio]', function() {
        self._handleChange($(this));
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

      _.each(this._sections, function(section) {
        section.selectedRowIndex = 0;
      });

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
    _handleChange: function($el) {
      var $row = $el.closest('.select-row');
      var $section = $el.closest('.section');
      var rowIndex = parseInt($row.data('index'), 10);
      var sectionIndex = parseInt($section.data('index'), 10);
      this._sections[sectionIndex].selectedRowIndex = rowIndex;
      this._makeResults();
      this._render();
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

      _.each(this._sections, function(section) {
        _.each(section.rows, function(row, rowIndex) {
          _.each(row.menus, function(menu) {
            if (rowIndex !== section.selectedRowIndex) {
              delete results[menu.key];
            }
          });
        });
      });

      this._results = results;
    },

    // ----------
    _render: function() {
      var self = this;

      var names = {
        horsepower: 'Horsepower',
        eng_size: 'Engine Size',
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

      var topLevelKeys = [
        'make',
        'price',
        'horsepower',
        'eng_size'
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

      // determine selects
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

        select.options = _.map(select.options, function(option) {
          return {
            key: option,
            name: option
          };
        });

        var topOption = {
          key: '---',
          name: select.name
        };

        if (!_.contains(topLevelKeys, select.key) && !_.contains(locationKeys, select.key)) {
          topOption.name = 'All ' + topOption.name + 's';
        }

        select.options.unshift(topOption);
      });

      selects = _.filter(selects, function(select) {
        var isExtraLocation = select.isLocation && hasLocation && !select.selected;
        return !isExtraLocation;
      });

      selects = _.object(_.pluck(selects, 'key'), selects);

      // build sections for template
      var templateSections = _.map(this._sections, function(section) {
        section = _.clone(section);

        section.rows = _.map(section.rows, function(row) {
          row = _.clone(row);

          row.menus = _.map(row.menus, function(menu) {
            menu = _.clone(menu);

            if (selects[menu.key]) {
              menu.select = selects[menu.key];
            }

            return menu;
          });

          row.menus = _.filter(row.menus, function(menu) {
            return !!menu.select;
          });

          return row;
        });

        section.rows = _.filter(section.rows, function(row) {
          return (row.name || row.menus.length);
        });

        return section;
      });

      // actually render
      this.$content.empty();

      App.template('vehicle-picker', {
        sections: templateSections
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
