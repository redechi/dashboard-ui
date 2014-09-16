(function() {
	'use strict';

	var root = this;

	root.define([
		'views/composite/trips'
		],
		function( Trips ) {

			describe('Trips Compositeview', function () {

				it('should be an instance of Trips Compositeview', function () {
					var trips = new Trips();
					expect( trips ).to.be.an.instanceof( Trips );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );
