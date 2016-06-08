(function() {

  // ----------
  App.vehiclePickerModal = {
    // ----------
    show: function(args) {
      var self = this;

      var names = {
        horsepower: 'Horsepower',
        engsize: 'Engine Size',
        make: 'Make',
        price: 'Price'
      };

      var topOptions = {"horsepower": ["150-250", "250-350", "< 150", "> 450", "350-450"], "engsize": ["2.0L-2.5L", "3.5L-4.0L", "1.5L-2.0L", "> 4L", "1.0L-1.5L", "3.0L-3.5L", "2.5L-3.0L"], "make": ["Cadillac", "Jaguar", "Saab", "Hyundai", "Toyota", "Land Rover", "Infiniti", "GMC", "Fiat", "Mazda", "Buick", "Dodge", "Scion", "Chrysler", "Chevrolet", "Volkswagen", "Mitsubishi", "Audi", "Nissan", "Acura", "Pontiac", "MINI", "Honda", "BMW", "Volvo", "Mercury", "Ford", "Kia", "Jeep", "Suzuki", "Lincoln", "Porsche", "Lexus", "Smart", "Ram", "Mercedes-Benz", "Saturn", "Subaru"], "price": ["20k-30k", "50k-75k", "75k-100k", "40k-50k", ">100k", "10k-20k", "30k-40k"]};

      var selects = _.map(topOptions, function(v, k) {
        var select = {
          key: k,
          name: names[k],
          options: ['---'].concat(v)
        };

        return select;
      });

      this.$el = $('.modal')
        .fadeIn()
        .on('click', function() {
          self.hide();
        });

      this.$el.find('.modal-dialog')
        .on('click', function(event) {
          event.stopPropagation();
        });

      this.$content = this.$el.find('.modal-content')
        .empty();

      App.template('vehicle-picker', {
        selects: selects
      }).appendTo(this.$content);

      this.$el.find('.close')
        .on('click', function() {
          self.hide();
        });

      this.$button = this.$el.find('.btn-select')
        .on('click', function() {
          if (!self.$button.hasClass('btn-disabled')) {
            var results = {};
            self.$selects.each(function(i, v) {
              var $select = $(v);
              var key = $select.data('key');
              var value = $select.val();
              if (value !== '---') {
                results[key] = value;
              }
            });

            self.hide();
            args.onComplete(results);
          }
        });

      this.$selects = this.$el.find('select')
        .on('change', function(event) {
          var found = false;
          self.$selects.each(function(i, v) {
            var $select = $(v);
            if ($select.val() !== '---') {
              found = true;
            }
          });

          self.$button.toggleClass('btn-disabled', !found);
        });
    },

    // ----------
    hide: function() {
      this.$el.fadeOut();
    }
  };

})();
