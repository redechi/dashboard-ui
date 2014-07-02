define([
	'backbone',
	'communicator'
],
function( Backbone, coms ) {
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

		url: "https://api.automatic.com/v1/user"

  });

	return new User();
});
