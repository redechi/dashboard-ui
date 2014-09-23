define([
  'backbone',
  'communicator',
  'hbs!tmpl/item/header_tmpl',
  '../../models/user',
  '../../controllers/login',
  '../../controllers/analytics'
],
function( Backbone, coms, HeaderTmpl, user, login, analytics ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    template: HeaderTmpl,
    model: user,
    

    initialize: function() {
      if (this.attributes.loggedIn) {
        this.model.fetch({error: login.fetchErrorHandler});
        this.render();
      }

      coms.on('user:change', _.bind(this.render, this));
    },


    events: {
      'click .whatIsAutomatic': 'whatIsAutomatic',
      'click .buyNow': 'buyNow',
      'click .widget-link': 'supportLink'
    },


    className: function() {
      return (login.isDemo()) ? 'demo' : 'loggedIn';
    },


    whatIsAutomatic: function() {
      analytics.trackEvent('what is Automatic', 'Click');
    },


    buyNow: function() {
      analytics.trackEvent('buy now', 'Click');
    },


    supportLink: function() {
      analytics.trackEvent('support', 'Click');
    },


    onRender: function() {
      this.loadGetSatisfaction();
    },


    onShow: function() {
      this.loadGetSatisfaction();
    },


    loadGetSatisfaction: function() {
      //Get Satisfaction feedback link
      if($('#getsat-widget-7348').length) {
        _.defer(function() {
          if (typeof GSFN !== 'undefined') {
            GSFN.loadWidget(7348, {containerId: 'getsat-widget-7348'});
          }
        });
      }
    }
  });
});
