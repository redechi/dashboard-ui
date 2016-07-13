(function() {

  // ----------
  window.App = {
    // ----------
    init: function() {
      var self = this;

      formatForDemo();
      showLoginLink('car-behavior');

      var queryParams = getQueryParams(document.location.search);
      if (queryParams.demo) {
      } else {
        this.getUserData();
      }
    },

    // ----------
    getUserData: function() {
      this.request({
        path: 'car-health-monitor/'
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
