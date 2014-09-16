(function() {
  'use strict';

  var root = this;

  root.define([
    'collections/vehicles'
    ],
    function( Vehicles ) {

      describe('Vehicles Collection', function () {

        it('should be an instance of Vehicles Collection', function () {
          var vehicles = new Vehicles();
          expect( vehicles ).to.be.an.instanceof( Vehicles );
        });

        it('should have more test written', function(){
          expect( false ).to.be.ok;
        });
      });

    });

}).call( this );
