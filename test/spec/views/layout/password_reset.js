(function() {
	'use strict';

	var root = this;

	root.define([
		'views/layout/password_reset'
		],
		function( PasswordReset ) {

			describe('PasswordReset Layout', function () {

				it('should be an instance of PasswordReset Layout', function () {
					var passwordReset = new PasswordReset();
					expect( passwordReset ).to.be.an.instanceof( PasswordReset );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );
