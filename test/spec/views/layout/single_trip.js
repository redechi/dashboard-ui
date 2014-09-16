(function() {
	'use strict';

	var root = this;

	root.define([
		'views/layout/single_trip'
		],
		function( SingleTrip ) {

			describe('SingleTrip Layout', function () {

				it('should be an instance of SingleTrip Layout', function () {
					var singleTrip = new SingleTrip();
					expect( singleTrip ).to.be.an.instanceof( SingleTrip );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );
