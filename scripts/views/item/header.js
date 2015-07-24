define([
  'backbone',
  'communicator',
  'hbs!tmpl/item/header_tmpl',
  '../../models/user',
  '../layout/overlay',
  '../../controllers/login',
  '../../controllers/cache',
  '../../controllers/analytics'
],
function( Backbone, coms, HeaderTmpl, user, OverlayLayout, login, cache, analytics ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    template: HeaderTmpl,
    model: user,


    initialize: function() {
      if(this.attributes.loggedIn && !login.isDemo()) {
        this.model.fetch({error: login.fetchErrorHandler});
        this.render();
      }
      coms.off('user:change');
      coms.on('user:change', this.render, this);

      // Check if user has licenseplus
      login.checkIfUserIsCoach();
    },


    events: {
      'click .whatIsAutomatic': 'whatIsAutomatic',
      'click .buyNow': 'buyNow',
      'click .support': 'supportLink',
      'click #licenseplusToggle .toggleContainer': 'showLicensePlus',
      'click #licenseplusToggle .licenseplusLink': 'showLicensePlus'
    },


    className: function() {
      return (login.isDemo()) ? 'demo' : 'loggedIn';
    },


    templateHelpers: function() {
      return {
        licenseplusMenu: cache.fetch('licensePlusProgram', true)
      };
    },


    showLicensePlus: function(e) {
      e.preventDefault();
      if(confirm('License+ has moved to licenseplus.automatic.com. Click "OK" to be redirected.')) {
        window.location = 'https://licenseplus.automatic.com';
      }
    },


    whatIsAutomatic: function() {
      analytics.trackEvent('what is Automatic', 'Click');
    },


    buyNow: function() {
      analytics.trackEvent('buy now', 'Click');
    },


    supportLink: function(e) {
      e.preventDefault();
      analytics.trackEvent('support', 'Click');

      new OverlayLayout({
        type: 'getSatisfaction'
      });

      if(typeof GSFN !== 'undefined') {
        $('#getsat-widget-7392').empty();
        GSFN.loadWidget(7392, {containerId: 'getsat-widget-7392'});
      }
    }
  });
});
