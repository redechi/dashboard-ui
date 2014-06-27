define([
  'backbone',
  'moment',
  '../controllers/unit_formatters'
],
function( Backbone, moment, formatters ) {
  'use strict';

  /* Return a model class definition */
  return Backbone.Model.extend({
    initialize: function(trip) {
      console.log('initialize a Trip model');

      moment.lang('en', {
        calendar : {
          lastDay : '[Yesterday]',
          sameDay : '[Today]',
          nextDay : '[Tomorrow]',
          lastWeek : 'MMM DD',
          nextWeek : 'MMM DD',
          sameElse : 'MMM DD'
        }
      });


      // format values
      var duration = ((this.get('end_time') - this.get('start_time')) / (1000 * 60)),
          miles = formatters.m_to_mi(this.get('distance_m'));

      this.set('duration', duration);
      this.set('distance_miles', miles);
      this.set('average_mpg', parseInt(this.get('average_mpg') * 100) /100);
      this.set('fuel_cost_usd', parseInt(this.get('fuel_cost_usd') * 100) /100);
      this.set('formatted_end_time', moment(this.get('end_time')).format('h:mm a').toUpperCase());
      this.set('formatted_start_time', moment(this.get('start_time')).format('h:mm a').toUpperCase());
      this.set('formatted_calendar_date', moment(this.get('start_time')).calendar());

      var score = this.calculateScore();
      this.set('score', score);
    },

    calculateScore: function() {
      var multiplier = 1.14;
      var brakingCoefficient = 26.6 * multiplier;
      var accelCoefficient = 20.1 * multiplier;
      var speeding70Coefficient = 4 * multiplier;
      var speeding75Coefficient = 9.41 * multiplier;
      var speeding80Coefficient = 7.92 * multiplier;

      var percentBraking = (this.get('hard_brakes') * 3 * 100) / (this.get('duration') * 60);
      var percentAccel = (this.get('hard_accels') * 3 * 100) / (this.get('duration') * 60);
      var percentSpeeding80 = (this.get('duration_over_80_s') * 100.0) / (this.get('duration') * 60);
      var percentSpeeding75 = (this.get('duration_over_75_s') * 100.0) / (this.get('duration') * 60);
      var percentSpeeding70 = (this.get('duration_over_70_s') * 100.0) / (this.get('duration') * 60);

      var score1 = 50 - percentBraking * brakingCoefficient - percentAccel * accelCoefficient;
      var score2 = 50 - percentSpeeding70 * speeding70Coefficient - percentSpeeding75 * speeding75Coefficient - percentSpeeding80 * speeding80Coefficient;

      var score = Math.max(0, score1) + Math.max(0, score2);

      if(this.get('duration') === 0) {
        //if trip doesn't have a length, give it 100
        return 100;
      } else {
        return Math.max(1, score);
      }
    },


    url: function () {
      return 'https://api.automatic.com/v1/trips/' + this.get('id');
    },

    defaults: {
    },

  });
});
