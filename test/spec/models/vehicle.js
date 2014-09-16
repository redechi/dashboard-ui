(function() {
	'use strict';

	var root = this;

	root.define([
		'models/vehicle'
		],
		function( Vehicle ) {

			describe('Vehicle Model', function () {

				it('should be an instance of Vehicle Model', function () {
					var vehicle = new Vehicle();
					expect( vehicle ).to.be.an.instanceof( Vehicle );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );
