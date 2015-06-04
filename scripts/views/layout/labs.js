define([
  'backbone',
  'regionManager',
  'hbs!tmpl/layout/labs_tmpl',
  '../item/header',
  '../../controllers/login'
],

function(Backbone, regionManager, LabsTmpl, HeaderView, login) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    template: LabsTmpl,
    className: 'labs',


    onRender: function() {
      regionManager.getRegion('main_header').show(new HeaderView({attributes: {
        loggedIn: login.isLoggedIn
      }}));
    }
  });
});
