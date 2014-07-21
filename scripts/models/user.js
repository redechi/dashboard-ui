define([
	'backbone',
	'communicator',
	'../controllers/login'
],
function( Backbone, coms, login ) {
    'use strict';

	/* Return a model class definition */
	var User = Backbone.Model.extend({
		initialize: function() {
			console.log("initialize a User model");
			this.on('change', function() {
				coms.trigger('user:change');
			});
		},

		defaults: {},

		url: login.getAPIUrl() + '/v1/user'

  });

	return new User();
});
