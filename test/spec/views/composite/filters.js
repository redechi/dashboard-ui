(function() {
	'use strict';

	var root = this;

	root.define([
		'views/composite/filters'
		],
		function( Filters ) {

			describe('Filters Compositeview', function () {

				it('should be an instance of Filters Compositeview', function () {
					var filters = new Filters();
					expect( filters ).to.be.an.instanceof( Filters );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );