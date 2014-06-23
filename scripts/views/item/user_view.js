define([
  'backbone',
  'hbs!tmpl/item/user_view_tmpl',
  './user_score_view',
  '../../models/user'
],
function( Backbone, UserViewTmpl, UserScoreView, user  ) {
    'use strict';

  /* Return a ItemView class definition */
  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a UserView ItemView");

      var userScoreView = new UserScoreView();

      this.on('render', userScoreView.paintGraph, this);

      this.model.fetch();

      //replace this when API is ready
      this.model.set({score: 89, mpg: 28.3, cost: '$137.17', distance: 1047, duration: '25:24'});

      this.render();
    },

    template: UserViewTmpl,

    /* ui selector cache */
    ui: {},

    /* Ui events hash */
    events: {
    },

    /* on render callback */
    onRender: function() {
      setTimeout(function() {
        $('.btn-user').popover({
          html: true,
          content: function() { return $('.userPopoverContent').html(); },
          placement: 'bottom'
        });
      }, 0);
    },

    model: user
  });
});
