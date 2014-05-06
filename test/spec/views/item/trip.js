(function() {
	'use strict';

	var root = this;

	root.define([
		'views/item/trip'
		],
		function( Trip ) {

			describe('Trip Itemview', function () {

				it('should be an instance of Trip Itemview', function () {
					var trip = new Trip();
					expect( trip ).to.be.an.instanceof( Trip );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );