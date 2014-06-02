(function() {
	'use strict';

	var root = this;

	root.define([
		'views/layout/trip'
		],
		function( Trip ) {

			describe('Trip Layout', function () {

				it('should be an instance of Trip Layout', function () {
					var trip = new Trip();
					expect( trip ).to.be.an.instanceof( Trip );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );