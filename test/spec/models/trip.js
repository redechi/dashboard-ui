(function() {
  'use strict';

  var root = this;

  root.define([
    'models/trip'
    ],
    function( Trip ) {

      describe('Trip Model', function () {

        it('should be an instance of Trip Model', function () {
          var trip = new Trip();
          expect( trip ).to.be.an.instanceof( Trip );
        });

        it('should have more test written', function(){
          expect( false ).to.be.ok;
        });
      });

    });

}).call( this );
