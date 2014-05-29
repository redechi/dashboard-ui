(function() {
	'use strict';

	var root = this;

	root.define([
		'views/item/trips_header'
		],
		function( TripsHeader ) {

			describe('TripsHeader Itemview', function () {

				it('should be an instance of TripsHeader Itemview', function () {
					var trips_header = new TripsHeader();
					expect( trips_header ).to.be.an.instanceof( TripsHeader );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );