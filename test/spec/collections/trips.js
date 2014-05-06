(function() {
  'use strict';

  var root = this;

  root.define([
    'collections/trips'
    ],
    function( Trips ) {

      describe('Trips Collection', function () {

        it('should be an instance of Trips Collection', function () {
          var trips = new Trips();
          expect( trips ).to.be.an.instanceof( Trips );
        });

        it('should have more test written', function(){
          expect( false ).to.be.ok;
        });
      });

    });

}).call( this );
