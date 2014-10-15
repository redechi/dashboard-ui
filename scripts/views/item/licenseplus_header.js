define([
  'backbone',
  'hbs!tmpl/item/licenseplus_header_tmpl'
],
function( Backbone, LicenseplusHeaderTmpl ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    template: LicenseplusHeaderTmpl,


    templateHelpers: function() {
      var student = this.model.get('student') || {};

      return {
        firstName: student.first_name,
        lastName: student.last_name,
        is_finished: this.model.get('is_finished')
      };
    }
  });
});
