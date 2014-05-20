(function() {
	'use strict';

	var root = this;

	root.define([
		'views/layout/summary'
		],
		function( Summary ) {

			describe('Summary Layout', function () {

				it('should be an instance of Summary Layout', function () {
					var summary = new Summary();
					expect( summary ).to.be.an.instanceof( Summary );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );