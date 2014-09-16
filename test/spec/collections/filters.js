(function() {
  'use strict';

  var root = this;

  root.define([
    'collections/filters'
    ],
    function( Filters ) {

      describe('Filters Collection', function () {

        it('should be an instance of Filters Collection', function () {
          var filters = new Filters();
          expect( filters ).to.be.an.instanceof( Filters );
        });

        it('should have more test written', function(){
          expect( false ).to.be.ok;
        });
      });

    });

}).call( this );
