(function() {
	'use strict';

	var root = this;

	root.define([
		'views/item/graph'
		],
		function( Graph ) {

			describe('Graph Itemview', function () {

				it('should be an instance of Graph Itemview', function () {
					var graph = new Graph();
					expect( graph ).to.be.an.instanceof( Graph );
				});

				it('should have more test written', function(){
					expect( false ).to.be.ok;
				});
			});

		});

}).call( this );