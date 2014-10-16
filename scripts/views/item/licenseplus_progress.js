define([
  'backbone',
  'communicator',
  'moment',
  'hbs!tmpl/item/licenseplus_progress_tmpl',
  '../../controllers/badges',
  '../../controllers/graph_helpers',
  '../../controllers/unit_formatters'
],
function( Backbone, coms, moment, LicenseplusProgressTmpl, badges, graphHelpers, formatters ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    template: LicenseplusProgressTmpl,


    events: {
      'click .badgeItem': 'showBadgeOverlay',
      'click .medal.completed': 'showBadgeOverlay',
      'click .completedMedal .medalImage': 'showBadgeOverlay'
    },


    templateHelpers: function() {
      // this.model.set({
      //     medal: 'silver',
      //     time_driven_s: 400000,
      //     score: 66,
      //     distance_driven_m: 3000000,
      //     started_at: '2014-09-20T18:58:45Z',
      //     ended_at: '2014-09-30T18:58:45Z',
      //     is_finished: true,
      //     badges: [
      //       {
      //         badge: 'highway_driving',
      //         progress: 1
      //       },
      //       {
      //         badge: 'night_driving',
      //         progress: 1
      //       },
      //       {
      //         badge: 'smooth_braking',
      //         progress: 1
      //       },
      //       {
      //         badge: 'smooth_acceleration',
      //         progress: 1
      //       },
      //       {
      //         badge: 'coach_accepted',
      //         progress: 1
      //       },
      //       {
      //         badge: 'welcome_badge',
      //         progress: 1
      //       },
      //     ],
      // });


      var totalRequiredHours = 100,
          remainingMinutes = Math.max((totalRequiredHours * 60) - Math.ceil(this.model.get('time_driven_s') / 60), 0),
          percentComplete = Math.min(Math.round(this.model.get('time_driven_s') / (totalRequiredHours * 60 * 60) * 100), 100),
          student = this.model.get('student') || {};

      this.model.set('percentComplete', percentComplete);

      return {
        medal: this.model.get('medal'),
        bronze: (this.model.get('medal') === 'bronze'),
        silver: (this.model.get('medal') === 'silver'),
        gold: (this.model.get('medal') === 'gold'),
        medalName: this.model.get('medal') || 'certified',
        timeRemaining: formatters.durationHours(remainingMinutes),
        percentComplete: percentComplete,
        distanceDriven: formatters.numberWithCommas(formatters.m_to_mi(this.model.get('distance_driven_m') || 0).toFixed()),
        startDate: this.model.get('started_at') ? moment(this.model.get('started_at')).format('MMM D, YYYY') : '',
        endDate: this.model.get('ended_at') ? moment(this.model.get('ended_at')).format('MMM D, YYYY') : '',
        badges: this.getBadges(),
        is_finished: this.model.get('is_finished'),
        firstName: student.first_name,
        lastName: student.last_name
      };
    },


    onRender: function() {
      var options = {
        duration: 1000,
        width: 85,
        height: 85,
        donut: 0.9
      };
      graphHelpers.scoreGraph(this.model.get('score'), $('svg', this.$el), options);
    },


    onShow: function() {
      var self = this;
      _.defer(_.bind(function() {
        $('.timeRemainingValue', self.$el).width(self.model.get('percentComplete') + '%');
      }, this));
    },


    getBadges: function() {
      return _.filter((this.model.get('badges') || []).map(function(item) {
        var badge = badges[item.badge] || {};
        badge.completed = (item.progress === 1);
        return badge;
      }), function(badge) {
        return badge.name !== undefined;
      });
    },


    showBadgeOverlay: function(e) {
      var slug = $(e.currentTarget).data('slug'),
          completed = !!$(e.currentTarget).data('completed'),
          badge = new Backbone.Model(badges[slug]),
          student = this.model.get('student') || {};

      badge.set({
        completed: completed,
        first_name: student.first_name,
        email: student.email
      });

      if(slug) {
        coms.trigger('licenseplus:showBadgeOverlay', badge);
      }
    }
  });
});
