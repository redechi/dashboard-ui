define([
  'backbone',
  '../layout/overlay',
  '../../models/settings',
  'hbs!tmpl/item/admin_tmpl'
],
function( Backbone, OverlayLayout, settingsModel, AdminTmpl  ) {
  'use strict';

  var coach;
  var CoachModel = Backbone.Model.extend({
      url: function () {
        return settingsModel.get('newton_host') + '/internal/licenseplus/';
      }
  });

  var reminder;
  var EmailReminderModel = Backbone.Model.extend({
      url: function () {
        return settingsModel.get('newton_host') + '/internal/licenseplus/reminder/';
      }
  });


  /* Return a ItemView class definition */
  return window.Admin = Backbone.Marionette.ItemView.extend({

    model: settingsModel,
    events: {
      'click .deleteCoach': 'removeCoach',
      'click .addCoach': 'addCoach',
      'click .sendReminder': 'sendReminder',
      'submit': 'prevent'
    },


    initialize: function () {
      new OverlayLayout({
        activeMask:true,
        type: 'admin',
        contentView: this
      });
    },


    prevent: function (e) {
      e.preventDefault();
    },


    templateHelpers: function () {
      return {
        isDemo: this.model.isDemo().toString(),
        isStaging: this.model.isStaging().toString(),
        isUsingStaging: this.model.isUsingStaging().toString()
      };
    },


    success: function () {
      this.$el.find('.message').removeClass('errorMessage');
      this.$el.find('.errorMessage').text('Successful Relationship Update');
    },


    error: function (req) {
      console.log(req);
      var detail = req.responseJSON.detail;
      var msg = detail || 'There was an error with the request. Try with new values.';
      this.$el.find('.message').addClass('errorMessage');
      this.$el.find('.message').text(msg);
    },


    sendReminder: function () {
      reminder = reminder || new EmailReminderModel({});
      reminder.sync('create', reminder, {
        skipCache: true,
        success: _.bind(this.success, this),
        error: _.bind(this.error, this)
      });
    },


    addCoach: function () {
      coach = coach || new CoachModel();
      coach.set('coach_email',  $('input[name="coachEmail"]').val());
      coach.sync('create', coach, {
        skipCache: true,
        success: _.bind(this.success, this),
        error: _.bind(this.error, this)
      });
    },


    removeCoach: function () {
      coach = coach || new CoachModel({});
      coach.sync('delete', coach, {
        skipCache: true,
        success: _.bind(this.success, this),
        error: _.bind(this.error, this)
      });
    },


    template: AdminTmpl,

  });
});
