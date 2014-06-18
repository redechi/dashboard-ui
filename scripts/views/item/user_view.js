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
      _.extend(this, new UserScoreView());
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
