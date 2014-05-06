(function() {
	'use strict';

	var root = this;

	root.define([
		'views/collection/trips'
		],
		function( Trips ) {

			describe('Trips Collectionview', function () {

				it('should be an instance of Trips Collectionview', function () {
					var trips = new Trips();
					expect( trips ).to.be.an.instanceof( Trips );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );