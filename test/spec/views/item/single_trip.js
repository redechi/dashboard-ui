(function() {
	'use strict';

	var root = this;

	root.define([
		'views/item/single_trip'
		],
		function( SingleTrip ) {

			describe('Single Trip Itemview', function () {

				it('should be an instance of SingleTrip Itemview', function () {
					var singleTrip = new SingleTrip();
					expect( singleTrip ).to.be.an.instanceof( SingleTrip );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );
