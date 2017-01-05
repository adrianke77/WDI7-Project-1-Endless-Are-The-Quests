// GAME SYSTEM CONSTRUCTOR
function GameSys() {
  this.movesMade = 0;
  this.windowStartWidth = $( window ).width()
  this.startFontHeight = 0
  this.windowScale = 0
  var self = this
}
GameSys.prototype.initNumbSeedFromString = function( string ) {
  // returns a number betwen 0 and 1 that will always generate for the string
  var valuesArr =
    "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ "
    .split( "" );
  var stringArr = string.split( "" );
  var seed = 13; // start value only
  for ( var i = 0; i < string.length; i++ ) {
    charValue = valuesArr.indexOf( stringArr[ i ] );
    seed += charValue;
  }
  var x = Math.sin( seed++ ) * 10000;
  numbSeed = x - Math.floor( x )
}
GameSys.prototype.makeKeypressListeners = function( worldBoardInstance ) {
  var self = this; //make context visible to inside of event handler
  $( document ).keyup( function( event ) {
    var isMoved = false
    switch ( event.which ) {
      case 87: // W, NW direction
        isMoved = worldBoardInstance.playerMove( "NW" );
        break;
      case 69: // E, NE direction
        isMoved = worldBoardInstance.playerMove( "NE" );
        break;
      case 68: // D, E direction
        isMoved = worldBoardInstance.playerMove( "E" );
        break;
      case 65: // A, W direction
        isMoved = worldBoardInstance.playerMove( "W" );
        break;
      case 88: // X, SE direction
        isMoved = worldBoardInstance.playerMove( "SE" );
        break;
      case 90: // Z, SW direction
        isMoved = worldBoardInstance.playerMove( "SW" );
        break;
      case 83: // S, wait for a turn
        isMoved = worldBoardInstance.playerMove( "wait" );
        break;
      case 70: // F, Shout to attract monsters
        isMoved = true;
        worldBoardInstance.shout();
        break;
    }
    if ( isMoved === true ) self.movesMade++
  } )
}
GameSys.prototype.makeZoomListener = function() {
  $( window ).resize( {
    self: this
  }, this.resizeInfoDisplay );
}
GameSys.prototype.makeFixedDisplays = function() {
  var healthDisplay = $( "<div></div>" );
  var strengthDisplay = $( "<div></div>" );
  var defenseDisplay = $( "<div></div>" );
  var controlguide = $( "<div></div>" )
  healthDisplay.addClass( "health display" )
  strengthDisplay.addClass( "strength display" )
  defenseDisplay.addClass( "defense display" )
  controlguide.addClass("controlguide display")
  var displays = $( "<div></div>" );
  displays.append( healthDisplay, strengthDisplay, defenseDisplay, controlguide )
  $( "body" ).append( displays )
  $( ".health" ).text( " Vitality" )
  $( ".strength" ).text( " Skill" )
  $( ".defense" ).text( " Defense" )
  this.startFontHeight = this.windowStartWidth / DisplayFontScale;
  $( ".display" ).css( "font-size", this.startFontHeight );
}
GameSys.prototype.resizeInfoDisplay = function( event ) {
  if ( typeof event !== "undefined" ) self = event.data.self;
  else
    self = this
  this.windowScale = $( window ).width() / self.windowStartWidth;
  var adjustedFontSize = self.startFontHeight * this.windowScale;
  $( ".display" ).css( "font-size", adjustedFontSize );
}
GameSys.prototype.resetGame = function( startString ) {
  $( ".gameBoard" ).remove();
  gameSys.initNumbSeedFromString( startString );
  var width, height
  width = genRange(20,30);
  height = genRange(20,30);
  var worldBoard = new WorldBoard( width, height );
  
  worldBoard.makeBlankBoardHtml();
  worldBoard.randomizeTerrain();
  worldBoard.drawTerrain();
  gameSys.makeKeypressListeners( worldBoard );
  gameSys.makeZoomListener();
  gameSys.makeFixedDisplays();
  gameSys.resizeInfoDisplay();
  worldBoard.initPlayer();
  worldBoard.randomizeCreatures();
  worldBoard.drawCreatures();
  //testing
  // worldBoard.drawEntireMap() //debug only, turn off when playing
}
GameSys.prototype.makeStartListener = function() {
  $( ".startbutton" ).click( {
    self: this
  }, this.startGame );
}
GameSys.prototype.startGame = function( event ) {
  self = event.data.self
  $( ".startbutton" ).addClass( "hidden" )
  $( ".textstring" ).removeClass( "hidden" )
  $( ".startgame" ).removeClass( "hidden" )
    .on( "click", function() {
      var startString = $( ".textstring" ).val()
      $( ".startmenu" ).addClass( "hidden" )
      self.resetGame( startString )
    } )
}

//MAIN CODE

var gameSys = new GameSys()
$( window ).css( "zoom", "100%" )
gameSys.makeStartListener();