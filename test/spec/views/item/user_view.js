(function() {
	'use strict';

	var root = this;

	root.define([
		'views/item/user_view'
		],
		function( UserView ) {

			describe('UserView Itemview', function () {

				it('should be an instance of UserView Itemview', function () {
					var user_view = new UserView();
					expect( user_view ).to.be.an.instanceof( UserView );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );