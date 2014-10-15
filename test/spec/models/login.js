(function() {
	'use strict';

	var root = this;

	root.define([
		'models/login'
		],
		function( Login ) {

			describe('Login Model', function () {

				it('should be an instance of Login Model', function () {
					var login = new Login();
					expect( login ).to.be.an.instanceof( Login );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );