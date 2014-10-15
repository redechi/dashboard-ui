(function() {
	'use strict';

	var root = this;

	root.define([
		'models/settings'
		],
		function( Settings ) {

			describe('Settings Model', function () {

				it('should be an instance of Settings Model', function () {
					var settings = new Settings();
					expect( settings ).to.be.an.instanceof( Settings );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );