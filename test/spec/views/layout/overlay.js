(function() {
	'use strict';

	var root = this;

	root.define([
		'views/layout/overlay'
		],
		function( Overlay ) {

			describe('Overlay Layout', function () {

				it('should be an instance of Overlay Layout', function () {
					var overlay = new Overlay();
					expect( overlay ).to.be.an.instanceof( Overlay );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );
