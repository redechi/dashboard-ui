define([
  'backbone',
  'communicator',
  'regionManager',
  'hbs!tmpl/layout/overlay_tmpl',
  '../../controllers/analytics'
],
function( Backbone, coms, regionManager, OverlayTmpl, analytics ) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    initialize: function() {
      coms.on('overlay:hide', _.bind(this.closeOverlay, this));
      coms.on('overlay:page', _.bind(this.updateLoadingOverlayCount, this));

      if(this.options.type === 'notSupported') {
        analytics.trackPageview('/unsupported');
      } else if(this.options.type === 'noTrips') {
        analytics.trackEvent('no trips overlay', 'Show');
      } else if(this.options.type === 'error403') {
        analytics.trackEvent('error403 overlay', 'Show');
      } else if(this.options.type === 'error500') {
        analytics.trackEvent('error500 overlay', 'Show');
      }
    },


    template: OverlayTmpl,


    className: function() {
      var classes = [this.options.type];
      if(this.options.isiPhone) {
        classes.push('isiPhone');
      } else if(this.options.isAndroid) {
        classes.push('isAndroid');
      }
      return classes.join(' ');
    },


    events: {
      'click a.btn-close': 'closeOverlay',
      'click a.iOSAppLink': 'iOSAppLink'
    },


    closeOverlay: function () {
      regionManager.getRegion('main_overlay').reset();
    },


    updateLoadingOverlayCount: function(count) {
      $('.loadingProgress').text(count + ' trips loaded');
    },


    iOSAppLink: function(e) {
      //wait a bit, if user doesn't have app ask if they would like to download it.
      document.location = $(e.target).attr('href');
      var time = (new Date()).getTime();
      setTimeout(function(){
        var now = (new Date()).getTime();

        if((now - time) < 400) {
          if(confirm('You do not seem to have Automatic installed. Would you like to download it from the app store?')) {
            document.location = 'https://itunes.apple.com/us/app/automatic/id596594365?mt=8';
          }
        }
      }, 300);
    }
  });

});
