(function() {
  'use strict';

  var root = this;

  root.define([
    'views/item/user_score_view'
    ],
    function( Userscore ) {

      describe('Userscore Itemview', function () {

        it('should be an instance of Userscore Itemview', function () {
          var userScore = new Userscore();
          expect( userScore ).to.be.an.instanceof( Userscore );
        });

        it('should have more test written', function(){
          expect( false ).to.be.ok;
        });
      });

    });

}).call( this );
