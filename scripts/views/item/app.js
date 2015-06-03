define([
  'backbone',
  'hbs!tmpl/item/app_tmpl'
],
function( Backbone, AppTmpl ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    tagName: 'li',
    template: AppTmpl,


    events: {
      'click .btn-disconnectApp': 'disconnectApp'
    },


    disconnectApp: function() {
      if(confirm('Are you sure you want to disconnect ' + this.model.get('name') + '?')) {
        this.model.destroy();
      }
    }

  });

});
