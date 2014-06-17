(function() {
	'use strict';

	var root = this;

	root.define([
		'views/layout/trip_list_layout'
		],
		function( TripListLayout ) {

			describe('TripListLayout Layout', function () {

				it('should be an instance of TripListLayout Layout', function () {
					var trip_list_layout = new TripListLayout();
					expect( trip_list_layout ).to.be.an.instanceof( TripListLayout );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );