(function() {
	'use strict';

	var root = this;

	root.define([
		'views/item/filter'
		],
		function( Filters ) {

			describe('Filters Itemview', function () {

				it('should be an instance of Filters Itemview', function () {
					var filters = new Filters();
					expect( filters ).to.be.an.instanceof( Filters );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );
