// GAME SYSTEM CONSTRUCTOR
function GameSys() {
  this.movesMade = 0;
}
GameSys.prototype.initNumbSeedFromString = function( string ) {
  // returns a number betwen 0 and 1 that will always generate for the string
  var valuesArr = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ ".split( "" );
  var stringArr = string.split( "" );
  var seed = 13; // start value only
  for ( var i = 0; i < string.length; i++ ) {
    charValue = valuesArr.indexOf( stringArr[ i ] );
    seed += charValue;
  }
  var x = Math.sin( seed++ ) * 10000;
  numbSeed = x - Math.floor( x );
}
GameSys.prototype.makeKeypressListeners = function( worldBoardInstance ) {
    var self = this;
    console.log(self)
    $( document ).keyup( function( event ) {
      var isMoved = false
      switch ( event.which ) {
        case 87: //w, NW direction
          isMoved = worldBoardInstance.playerMove( "NW" );
          break;
        case 69: //e, NE direction
          isMoved = worldBoardInstance.playerMove( "NE" );
          break;
        case 68: //d, E direction
          isMoved = worldBoardInstance.playerMove( "E" );
          break;
        case 65: //a, W direction
          isMoved = worldBoardInstance.playerMove( "W" );
          break;
        case 88: //x, SE direction
          isMoved = worldBoardInstance.playerMove( "SE" );
          break;
        case 90: //z, SW direction
          isMoved = worldBoardInstance.playerMove( "SW" );
          break;
      }
      if ( isMoved === true ) self.movesMade++
    } )
  }
  //MAIN CODE
var worldBoard = new WorldBoard( 20, 20 );
var gameSys = new GameSys();
gameSys.initNumbSeedFromString( "dragon" );
worldBoard.makeBlankBoardHtml();
worldBoard.randomizeTerrain();
worldBoard.drawTerrain();
worldBoard.initPlayer();
worldBoard.randomizeCreatures();
worldBoard.drawCreatures();
gameSys.makeKeypressListeners( worldBoard );
console.log( worldBoard.validMoves( "walk", 0,0 ) )
  //TESTING STUFF