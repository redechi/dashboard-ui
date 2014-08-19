define([
	'backbone',
	'communicator',
	'../controllers/login'
],
function( Backbone, coms, login ) {
    'use strict';

	var User = Backbone.Model.extend({
		initialize: function() {
			this.on('change', function() {
				coms.trigger('user:change');
			});
		},

		url: login.getAPIUrl() + '/v1/user'
  });

	return new User();
});
