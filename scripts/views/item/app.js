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
      'click .btn-revokeApp': 'revokeApp'
    },


    revokeApp: function() {
      if(confirm('Are you sure you want to revoke access from ' + this.model.get('name') + '?')) {
        this.model.destroy();
      }
    }

  });

});
