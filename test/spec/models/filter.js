(function() {
	'use strict';

	var root = this;

	root.define([
		'models/filter'
		],
		function( Filter ) {

			describe('Filter Model', function () {

				it('should be an instance of Filter Model', function () {
					var filter = new Filter();
					expect( filter ).to.be.an.instanceof( Filter );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );