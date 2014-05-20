(function() {
	'use strict';

	var root = this;

	root.define([
		'views/item/map'
		],
		function( Map ) {

			describe('Map Itemview', function () {

				it('should be an instance of Map Itemview', function () {
					var map = new Map();
					expect( map ).to.be.an.instanceof( Map );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );