(function() {
	'use strict';

	var root = this;

	root.define([
		'views/layout/login'
		],
		function( Login ) {

			describe('Login Layout', function () {

				it('should be an instance of Login Layout', function () {
					var login = new Login();
					expect( login ).to.be.an.instanceof( Login );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );
