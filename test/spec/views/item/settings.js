(function() {
	'use strict';

	var root = this;

	root.define([
		'views/item/settings'
		],
		function( Settings ) {

			describe('Settings Itemview', function () {

				it('should be an instance of Settings Itemview', function () {
					var settings = new Settings();
					expect( settings ).to.be.an.instanceof( Settings );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );