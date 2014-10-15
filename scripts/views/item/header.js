define([
  'backbone',
  'communicator',
  'regionManager',
  'hbs!tmpl/item/header_tmpl',
  '../../models/user',
  '../../models/licenseplus',
  '../layout/overlay',
  '../../controllers/login',
  '../../controllers/analytics'
],
function( Backbone, coms, regionManager, HeaderTmpl, user, Licenseplus, OverlayLayout, login, analytics ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    template: HeaderTmpl,
    model: user,


    initialize: function() {
      var self = this;
      if (this.attributes.loggedIn) {
        this.model.fetch({error: login.fetchErrorHandler});
        var licenseplus = new Licenseplus();
        licenseplus.fetch({success: function() {
          self.isCoach = (licenseplus.get('user_type') === 'coach');
          self.render();
        }});

        this.render();
      }

      coms.on('user:change', this.render, this);
    },


    events: {
      'click .whatIsAutomatic': 'whatIsAutomatic',
      'click .buyNow': 'buyNow',
      'click .support': 'supportLink',
      'click #licenseplusToggle .toggleContainer': 'toggleLicenseplusMenu'
    },


    className: function() {
      return (login.isDemo()) ? 'demo' : 'loggedIn';
    },


    templateHelpers: function() {
      return {
        licenseplusMenu: this.setLicenseplusMenuClass()
      };
    },


    setLicenseplusMenuClass: function() {
      if(this.isCoach) {
        if(this.attributes.licenseplusMenu === 'licenseplus') {
          return 'left';
        } else if(this.attributes.licenseplusMenu === 'dashboard') {
          return 'right';
        }
      } else {
        return undefined;
      }
    },


    toggleLicenseplusMenu: function() {
      if($('#licenseplusToggle .toggle').hasClass('right')) {
        Backbone.history.navigate('#licenseplus', {trigger: true});
      } else {
        Backbone.history.navigate('#', {trigger: true});
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

      regionManager.getRegion('main_overlay').show(new OverlayLayout({type: 'getSatisfaction'}));

      if(typeof GSFN !== 'undefined') {
        $('#getsat-widget-7392').empty();
        GSFN.loadWidget(7392, {containerId: 'getsat-widget-7392'});
      }
    }
  });
});
