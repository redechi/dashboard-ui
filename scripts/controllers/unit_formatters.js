define([
],
function() {
  'use strict';

  return {
    mpg:   function(d) { return d.value + ' mpg'; },
    miles: function(d) { return d.value + ' miles'; }, 
    hours: function(d) { return d.value + ' hours'; }, 
    trips: function(d) { return d.value + ' trips'; },
    score: function(d) { return d.value + ' trips'; },
    gallons: function(d) { return d.value + ' gallons'; },
    fuel_cost: function(d) { return '$' + d.value; }
  };
});

