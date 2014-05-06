(function() {
	'use strict';

	var root = this;

	root.define([
		'views/item/empty'
		],
		function( Empty ) {

			describe('Empty Itemview', function () {

				it('should be an instance of Empty Itemview', function () {
					var empty = new Empty();
					expect( empty ).to.be.an.instanceof( Empty );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );