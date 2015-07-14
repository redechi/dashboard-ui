define([
  './unit_formatters'
],
function(formatters) {
  'use strict';

  return {

    highway_driving: {
      slug: 'highway_driving',
      name: 'Highway Driving',
      requirement: 'drive 20 hours on the highway',
      accomplishment: 'drove 20 hours on the highway',
      type: 'badge'
    },

    night_driving: {
      slug: 'night_driving',
      name: 'Night Driving',
      requirement: 'drive 10 hours at night with their coach',
      accomplishment: 'drove 10 hours at night with their coach',
      type: 'badge'
    },

    smooth_braking: {
      slug: 'smooth_braking',
      name: 'Smooth Braking',
      requirement: 'drive 50 city miles with no hard brakes',
      accomplishment: 'drove 50 city miles with no hard brakes',
      type: 'badge'
    },

    smooth_acceleration: {
      slug: 'smooth_acceleration',
      name: 'Smooth Acceleration',
      requirement: 'drive 50 city miles with no hard accelerations',
      accomplishment: 'drove 50 city miles with no hard accelerations',
      type: 'badge'
    },

    coach_accepted: {
      slug: 'coach_accepted',
      name: 'Coach Accepted',
      requirement: 'invite someone to be their coach',
      accomplishment: 'invited you to be their coach',
      type: 'badge'
    },

    welcome_badge: {
      slug: 'welcome_badge',
      name: 'Welcome Badge',
      requirement: 'complete their first trip in License+',
      accomplishment: 'completed their first trip in License+',
      type: 'badge'
    },

    bronze: {
      slug: 'bronze',
      name: 'License+ BRONZE Medal',
      requirement: 'complete 100 hours of coached driving in License+ with a score of 70-79',
      accomplishment: 'completed 100 hours of coached driving in License+ with a score between 70-79',
      type: 'medal'
    },

    silver: {
      slug: 'silver',
      name: 'License+ SILVER Medal',
      requirement: 'complete 100 hours of coached driving in License+ with a score of 80-89',
      accomplishment: 'completed 100 hours of coached driving in License+ with a score between 80-89',
      type: 'medal'
    },

    gold: {
      slug: 'gold',
      name: 'License+ GOLD Medal',
      requirement: 'complete 100 hours of coached driving in License+ with a score of 90-100',
      accomplishment: 'completed 100 hours of coached driving in License+ with a score 90 or above',
      type: 'medal'
    },

    certified: {
      slug: 'certified',
      name: 'License+ Certified',
      requirement: 'complete 100 hours of coached driving in License+',
      accomplishment: 'completed 100 hours of coached driving in License+',
      type: 'medal'
    }

  };

});
