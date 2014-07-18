(function() {
	'use strict';

	var root = this;

	root.define([
		'views/item/header'
		],
		function( HeaderView ) {

			describe('HeaderView Itemview', function () {

				it('should be an instance of HeaderView Itemview', function () {
					var header_view = new HeaderView();
					expect( header_view ).to.be.an.instanceof( HeaderView );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );
