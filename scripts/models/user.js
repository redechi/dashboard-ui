define([
	'backbone'
],
function( Backbone ) {
    'use strict';

	/* Return a model class definition */
	var User = Backbone.Model.extend({
		initialize: function() {
			console.log("initialize a User model");
		},

		defaults: {},

		url: "https://api.automatic.com/v1/user"

  });

	return new User();
});
