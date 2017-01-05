// when accessing array or HTML : y first, then x (and R-Y-C-X on CSS selectors)
// when passing arguments to function or handling coord-pair array : x first, then y

// make sound reference vars
const hit = document.getElementById( "hit" );
const heromiss = document.getElementById( "heromiss" );
const monstermiss = document.getElementById( "monstermiss" );
const step = document.getElementById( "step" );
const birds1 = document.getElementById( "birds1" );
const birds2 = document.getElementById( "birds2" );
const birds3 = document.getElementById( "birds3" );
const birds4 = document.getElementById( "birds4" );
const monsterdeath = document.getElementById( "monsterdeath" );
const playerdeath = document.getElementById( "playerdeath" );
const levelup = document.getElementById( "levelup" );
const shout = document.getElementById( "shout" );

const DisplayFontScale = 30 // the bigger the nunmber the smaller the display font size

const difficulty = 40 // the bigger the number the harder the game

const shouts = [ "GET OVER HERE!" ]

const landTilesCoords = {
  plain: [ 0, 0 ],
  swamp: [ -36, 0 ],
  hill: [ -72, 0 ],
  water: [ -18, -33 ],
  mountain: [ -54, -33 ],
  forest: [ -36, -66 ],
  dune: [ -72, -66 ],
  fog: [ 0, -66 ]
}

const creatureTypes = {
  //name:[0:health 1:movement 2:strength 3:speed 4:treasureMin 5:treasureMax
  // 6: spriteX, 7: spriteY 8:rarity]
  //sprite X and Y are in 1-index
  //the higher the rarity the less common the monster
  //treasureMax is a non-included max
  //for drawing sprite;
  greyhawk: [ 2, "fly", 4, 3, 0, 3, 7, 5, 10 ],
  kobold: [ 3, "walk", 3, 1, 2, 4, 4, 2, 10 ],
  dobermad: [ 3, "walk", 2, 2, 0, 3, 7, 3, 10 ],
  deathrose: [ 5, "walk", 5, 1, 3, 5, 5, 3, 20 ],
  poltergeist: [ 6, "fly", 6, 1, 3, 5, 2, 1, 25 ],
  gargoyle: [ 7, "fly", 7, 1, 3, 5, 4, 1, 30 ],
  windgoblin: [ 8, "fly", 8, 1, 3, 5, 7, 2, 35 ],
  zombie: [ 9, "walk", 9, 1, 3, 5, 5, 2, 40 ],
  nightmare: [ 10, "walk", 10, 1, 3, 5, 9, 2, 45 ],
  redbull: [ 11, "walk", 11, 1, 3, 5, 6, 4, 50 ],
  basilisk: [ 12, "walk", 12, 1, 3, 5, 9, 3, 55 ],
  acidmound: [ 13, "walk", 13, 1, 3, 5, 1, 4, 60 ],
  crystalcrab: [ 14, "walk", 14, 1, 3, 5, 3, 4, 65 ],
  greatsnake: [ 15, "walk", 15, 1, 3, 5, 7, 4, 70 ],
  brickgolem: [ 16, "walk", 16, 1, 3, 5, 3, 5, 75 ],
  stingwing: [ 17, "fly", 17, 1, 3, 5, 2, 2, 80 ],
  ogre: [ 18, "walk", 18, 1, 3, 5, 5, 6, 85 ],
  treant: [ 19, "walk", 19, 1, 3, 5, 7, 6, 90 ],
  demonknight: [ 20, "walk", 20, 1, 3, 5, 1, 5, 9999 ],
}

const terrainDefenseVals = {
  // bonus to defense when being attacked depending on terrain
  plain: 1,
  swamp: 0.8,
  water: 1,
  mountain: 1.5,
  forest: 1.25
}

var numbSeed = 0
  // this number will change every time genNumbSeed is called

//REPEATABLE RANDOM GENERATION
function genNum() {
  //every time this function is called it will both replace global 
  // numbSeed value as well as return the new numbSeed value
  // copied from StackOverflow
  var x = Math.sin( numbSeed++ ) * 10000;
  numbSeed = x - Math.floor( x );
  return numbSeed
}

function genMax( max ) {
  //uses genNum to return an integer between 0 and max, 
  //including 0 and excluding max
  return Math.floor( genNum() * ( max ) );
}

function genRange( min, max ) {
  //uses genNum to return an integer in range, 
  //including min and excluding max
  return Math.floor( genMax( max - min ) + min );
}
//MISC FUNCTIONS
function minZero( input ) {
  //forces value to have minimum of zero
  var output = input;
  if ( output < 0 ) output = 0;
  return output
}

function factorial( number ) {
  //returns factorial of number
  var output = 0;
  for ( i = 0; i < number; i++ )
    output += i;
  return output
}

//PLAYER CONSTRUCTOR
function Player() {
  this.type = "player"
  this.health = 15
  this.maxHealth = 15
  this.movement = "walk"
  this.strength = 3
  this.speed = 1
  this.gold = 10
  this.xp = 0
  this.xpToNextLevel = 0
  this.xpPrevLevel = 0
}

//CREATURE CONSTRUCTOR
function Creature( type, statsArr ) {
  this.type = type;
  this.health = statsArr[ 0 ];
  this.movement = statsArr[ 1 ];
  this.strength = statsArr[ 2 ];
  this.speed = statsArr[ 3 ];
  this.treasureMin = statsArr[ 4 ];
  this.treasureMax = statsArr[ 5 ];
  this.isHunting = false;
  this.justMoved = false;
}

//WORLDBOARD CONSTRUCTOR
function WorldBoard( width, height ) {
  this.playerX = 1;
  this.playerY = 1;
  this.height = height;
  this.width = width;
  this.xpScale = 1;
  this.landTiles = []; // stores terrain as strings
  this.creatureLocs = []; //stores creatures as Creature instances
  for ( var i = 0; i < this.height; i++ ) {
    this.landTiles[ i ] = [];
    this.creatureLocs[ i ] = [];
    for ( var j = 0; j < this.width; j++ ) {
      this.landTiles[ i ][ j ] = null;
      this.creatureLocs[ i ][ j ] = null;
    }
  }
  this.noFogZone = []; // stores the last known noFogZone as a list of 
  //coordinates
  this.oldNoFogZone = []; //stores the old zone to clear after each step
}
WorldBoard.prototype.makeBlankBoardHtml = function() {
  var gameBoard = $( "<div></div" );
  gameBoard.addClass( "gameBoard" );
  this.landTiles.forEach( function( row, rowidx ) {
    row.forEach( function( tile, colidx ) {
      var landCell = $( "<div></div>" );
      var creatureCell = $( "<div></div>" );
      var fogCell = $( "<div></div>)" );
      landCell.addClass( "landbox landR" + rowidx + "C" + colidx );
      creatureCell.addClass( "creatbox creatR" + rowidx + "C" +
        colidx + " waiting" );
      fogCell.addClass( "fogbox fogR" + rowidx + "C" + colidx +
        " fog drawin" );
      var rowshift =
        rowidx % 2 === 0 ? 15 : 0;
      var topPos = 24 * rowidx;
      var leftPos = 30 * colidx + rowshift;
      landCell.css( {
        "top": topPos,
        "left": leftPos
      } );
      creatureCell.css( {
        "top": topPos,
        "left": leftPos
      } );
      fogCell.css( {
        "top": topPos,
        "left": leftPos
      } );
      gameBoard.append( landCell, creatureCell, fogCell );
    } );
  } );
  var forceSizeTile = $( "<div></div>" );
  vertical = ( this.landTiles.length + 4 ) * 24
  horizontal = ( this.landTiles[ 0 ].length + 4 ) * 30
  forceSizeTile.css( {
      top: vertical,
      left: horizontal
    } )
    .addClass( "forceSizeTile landbox" )
  gameBoard.append( forceSizeTile )
  $( "body" ).append( gameBoard )
}
WorldBoard.prototype.drawTerrain = function() {
  this.landTiles.forEach( function( row, rowidx ) {
    row.forEach( function( tile, colidx ) {
      var xpos = landTilesCoords[ tile ][ 0 ];
      var ypos = landTilesCoords[ tile ][ 1 ];
      var posString = xpos + "px " + ypos + "px";
      $( " .landR" + rowidx + "C" + colidx )
        .css( "background-position", posString )
    } );
  } );
}
WorldBoard.prototype.randomizeTerrain = function() {
  var x = this.width;
  var y = this.height;
  var tilesNumber = x * y;
  this.landTiles.forEach( function( row, rowidx, arr ) {
    row.forEach( function( tile, colidx, row ) {
      arr[ rowidx ][ colidx ] = "plain" //initialize all as plain
    } )
  } )
  var swampTiles = Math.floor( tilesNumber / 4 );
  var forestTiles = Math.floor( tilesNumber / 3 );
  var mountainTiles = Math.floor( tilesNumber / 5 );
  var waterTiles = Math.floor( tilesNumber / 2 );
  for ( var i = 0; i < waterTiles; i++ )
    this.landTiles[ genMax( y ) ][ genMax( x ) ] = "water";
  for ( var i = 0; i < swampTiles; i++ )
    this.landTiles[ genMax( y ) ][ genMax( x ) ] = "swamp";
  for ( var i = 0; i < forestTiles; i++ )
    this.landTiles[ genMax( y ) ][ genMax( x ) ] = "forest";
  for ( var i = 0; i < mountainTiles; i++ )
    this.landTiles[ genMax( y ) ][ genMax( x ) ] = "mountain";
  this.landTiles[ 1 ][ 1 ] = "forest" // make sure player starts in a forest
}
WorldBoard.prototype.drawEntireMap = function() {
  //check all land/monster locations, used for debugging
  var self = this;
  this.landTiles.forEach( function( row, rowindex ) {
    row.forEach( function( tile, colindex ) {
      $( ".fogR" + rowindex + "C" + colindex ).removeClass( "fog" );
      $( ".landR" + rowindex + "C" + colindex ).addClass(
        "background" );
      self.drawCreature( colindex, rowindex );
    } )
  } )
}
WorldBoard.prototype.randomizeCreatures = function() {
  //sprite X and Y are in 1-index

  for ( creatureType in creatureTypes ) {
    var maxY = this.height;
    var maxX = this.width;
    var tilesNumber = maxX * maxY;
    noOfMonster = Math.floor( tilesNumber / creatureTypes[ creatureType ][ 8 ] ) +
      1;
    for ( var i = 0; i < noOfMonster; i++ ) {
      this.makeACreature( creatureType )
    }
  }
}
WorldBoard.prototype.makeACreature =
  function( creatureType ) {
    // creates one new creature at position given, if failed, calls 
    // itself recursively
    var movement = creatureTypes[ creatureType ][ 1 ];
    var strength = creatureTypes[ creatureType ][ 2 ];
    var strengthScaled =
      Math.floor( ( strength - 3 ) * Math.sqrt( this.width * this.height ) /
        20 );
    if ( strengthScaled >= this.width ) strengthScaled = this.width - 1
    if ( strengthScaled >= this.height ) strengthScaled = this.height - 1
      // prevent it from going outside the map
    var xpos = minZero( genRange( strengthScaled, this.width ) );
    var ypos = minZero( genRange( strengthScaled, this.height ) );
    var terrainHere = this.landTiles[ ypos ][ xpos ];
    if ( this.canMoveOnTerrain( movement, terrainHere ) )
      if ( !( xpos === 1 && ypos === 1 ) ) {
        this.creatureLocs[ ypos ][ xpos ] =
          new Creature( creatureType, creatureTypes[ creatureType ] );
        return
      }
    this.makeACreature( creatureType ) //if fail, run makeACreature again
  }
WorldBoard.prototype.canMoveOnTerrain = function( movement, terrain ) {
  if ( ( movement === "walk" && terrain === "water" ) ) return false;
  if ( ( movement === "fly" && terrain === "forest" ) ) return false;
  return true;
}
WorldBoard.prototype.drawCreatures = function() {
  //deletes creatures in oldNoFogZone, then draws creatures in noFogZone
  var self = this;
  this.oldNoFogZone.forEach( function( ele, ind, arr ) {
    var x = ele[ 0 ];
    var y = ele[ 1 ];
    $( ".creatR" + y + "C" + x ).removeClass( "creature" ).removeClass(
      "hunting" );
  } )
  this.noFogZone.forEach( function( ele, ind, arr ) {
    var x = ele[ 0 ];
    var y = ele[ 1 ];
    self.drawCreature( x, y );
  } )

}
WorldBoard.prototype.drawCreature = function( x, y ) {
  // redraws cell at x,y according to if there is a creature in creatureLoc 
  var self = this
  var creature = this.creatureLocs[ y ][ x ]
  $( ".creatR" + y + "C" + x ).removeClass( "creature" ) //delete image if there
  if ( creature ) {
    if ( creature.type === "player" ) {
      var xpos = ( 6 - 1 ) * -20;
      var ypos = ( 2 - 1 ) * -20.5;
    } else {
      var xpos = ( creatureTypes[ creature.type ][ 6 ] - 1 ) * -20;
      var ypos = ( creatureTypes[ creature.type ][ 7 ] - 1 ) * -20.7;
    }
    var posString = xpos + "px " + ypos + "px";
    // make string to shift spritesheet to
    var terrainHere = self.landTiles[ y ][ x ];
    $( ".creatR" + y + "C" + x )
      .addClass( "creature" )
      .css( "background-position", posString )
  }
  this.ifHuntingAnimate( x, y )
}
WorldBoard.prototype.initPlayer = function() {
  this.creatureLocs[ 1 ][ 1 ] = new Player()
  player = this.creatureLocs[ 1 ][ 1 ]
  player.xpToNextLevel = this.getXpNeededForLevel( 3 )
  this.updateFog();
  this.updateHealthDisplay();
  this.updateSkillDisplay();
  this.updateDefenseDisplay();

}
WorldBoard.prototype.updateFog = function() {
  var noFogZone = this.calculateNoFogZone( this.playerX, this.playerY )
  this.landTiles.forEach( function( row, rowidx ) {
    row.forEach( function( tile, colidx ) {
      $( ".fogR" + rowidx + "C" + colidx ).addClass( "fog" );
    } )
  } )
  noFogZone.forEach( function( ele ) {
    var x = ele[ 0 ];
    var y = ele[ 1 ];
    $( ".fogR" + y + "C" + x ).removeClass( "fog" )
    $( ".landR" + y + "C" + x ).addClass( "background" ).addClass(
      "drawin" )
  } )
  this.oldNoFogZone = this.noFogZone
  this.noFogZone = noFogZone;
  this.drawCreatures();
}
WorldBoard.prototype.calculateNoFogZone = function( playerX, playerY ) {
  //calculates a two-cell range around the player location
  //that should be non-foggy
  var self = this
  var noFogCore = this.nearbyCells( playerX, playerY );
  var noFogZone = [];
  noFogCore.forEach( function( ele ) {
    var x = ele[ 0 ];
    var y = ele[ 1 ];
    noFogZone = noFogZone.concat( self.nearbyCells( x, y ) )
  } )
  return noFogZone
}
WorldBoard.prototype.nearbyCells = function( x, y ) {
  //returns array of coords of the six nearby hexes if inside board
  //each coord is [xValue,yValue]
  if ( x < 0 || y < 0 || x >= this.width || y >= this.height ) return false
  var hexArray
  var self = this
  hexArray = [
    this.cellInDirection( "E", x, y ),
    this.cellInDirection( "W", x, y ),
    this.cellInDirection( "NW", x, y ),
    this.cellInDirection( "NE", x, y ),
    this.cellInDirection( "SW", x, y ),
    this.cellInDirection( "SE", x, y )
  ]
  var filteredForOutsideBoard = hexArray.filter( function( coords ) {
    return coords[ 0 ] > -1 && coords[ 1 ] > -1 &&
      coords[ 0 ] < self.width && coords[ 1 ] < self.height;
  } )
  return filteredForOutsideBoard;
}
WorldBoard.prototype.validMoves = function( movement, x, y ) {
  //checks all grid locations around x,y for valid moves
  //returns an array with each location a pair in an array
  var self = this;
  var cellsToCheck = this.nearbyCells( x, y );
  var validMoves = [];
  if ( movement === "walk" ) {
    validMoves = cellsToCheck.filter( function( ele, ind, arr ) {
      var x = ele[ 0 ];
      var y = ele[ 1 ];
      return ( self.landTiles[ y ][ x ] !== "water" )
    } )
  }
  if ( movement === "fly" ) {
    validMoves = cellsToCheck.filter( function( ele, ind, arr ) {
      var x = ele[ 0 ];
      var y = ele[ 1 ];
      return ( self.landTiles[ y ][ x ] !== "forest" )
    } )
  }
  return validMoves;
}
WorldBoard.prototype.cellInDirection = function( direction, x, y ) {
  //returns the coordinates of the cell that is in the direction given
  //x and y inputs are the origin location
  switch ( direction ) {
    case "E":
      return [ x + 1, y ];
      break;
    case "W":
      return [ x - 1, y ];
      break;
    case "NW":
      if ( y % 2 === 0 )
        return [ x, y - 1 ];
      else return [ x - 1, y - 1 ];
      break;
    case "NE":
      if ( y % 2 === 0 )
        return [ x + 1, y - 1 ];
      else return [ x, y - 1 ];
      break;
    case "SW":
      if ( y % 2 === 0 )
        return [ x, y + 1 ];
      else return [ x - 1, y + 1 ];
      break;
    case "SE":
      if ( y % 2 === 0 )
        return [ x + 1, y + 1 ];
      else return [ x, y + 1 ];
      break;
  }
}
WorldBoard.prototype.playerMove = function( direction ) {
  //checks if player can move to cell in direction, and if so moves him
  //need to update this.playerX, this.playerY, and creatureLocs as well
  //returns true if an action was performed(move or attack))'
  var self = this
  var x = this.playerX;
  var y = this.playerY;
  if ( direction === "wait" ) {
    this.updateFog( targetX, targetY );
    this.enemyTurn();
    return true;
  }
  var targetCell = this.cellInDirection( direction, x, y );
  var targetX = targetCell[ 0 ];
  var targetY = targetCell[ 1 ];
  var player = this.creatureLocs[ y ][ x ];
  var validMoves = this.validMoves( player.movement, x, y );
  var isMoveValid = false;
  validMoves.forEach( function( ele ) {
    if ( targetX === ele[ 0 ] && targetY === ele[ 1 ] ) {
      isMoveValid = true;
    }
  } )
  if ( isMoveValid && self.creatureLocs[ targetY ][ targetX ] === null ) {
    //move to empty square
    step.play()
    var playerX = this.playerX;
    var playerY = this.playerY;
    if ( playerY % 2 === 0 ) {// odd row (zero index)
      if ( targetY > playerY ) {
        if ( targetX === playerX ) //NW
          window.scrollBy( -15, 24 )
        if ( targetX > playerX ) //NE
          window.scrollBy( 15, 24)
      }
      if ( targetY === playerY ) {
        if ( targetX > playerX ) //E
          window.scrollBy( 30, 0 )
        if ( targetX < playerX ) //W
          window.scrollBy( -30, 0 )
      }
      if ( targetY < playerY ) {
        if ( targetX === playerX ) //SW
          window.scrollBy( -15, -24 )
        if ( targetX > playerX ) //SE
          window.scrollBy( 15, -24)
      }
    }
    if ( playerY % 2 !== 0 ) {// even row (zero index)
      if ( targetY > playerY ) {
        if ( targetX < playerX ) //NW
          window.scrollBy( -15, 24 )
        if ( targetX === playerX ) //NE
          window.scrollBy( 15, 24 )
      }
      if ( targetY === playerY ) {
        if ( targetX > playerX ) //E
          window.scrollBy( 30, 0 )
        if ( targetX < playerX ) //W
          window.scrollBy( -30, 0 )
      }
      if ( targetY < playerY ) {
        if ( targetX < playerX ) //SW
          window.scrollBy( -15, -24 )
        if ( targetX === playerX ) //SE
          window.scrollBy( 15, -24 )
      }
    }
    this.playerX = targetX;
    this.playerY = targetY;
    this.creatureLocs[ targetY ][ targetX ] = self.creatureLocs[ y ][ x ];
    this.creatureLocs[ y ][ x ] = null;
    this.drawCreature( x, y ); // clear old cell
    this.drawCreature( targetX, targetY ); // draw at new cell
    this.updateFog( targetX, targetY );
    this.updateDefenseDisplay();
    this.enemyTurn();
    return true;
  }
  if ( isMoveValid && self.creatureLocs[ targetY ][ targetX ] !== null ) {
    this.attackByPlayer( player, targetX, targetY );
    this.enemyTurn();
    return true;
  }
  return false;
}
WorldBoard.prototype.shout = function() {
  shoutChoice = shouts[ Math.floor( Math.random() * shouts.length ) ]
  this.popup( shoutChoice, 0.5, "white", this.playerX, this.playerY )
  shout.play()
  var self = this;
  nearCells = this.nearbyCells( this.playerX, this.playerY )
  nearCells.forEach( function( location ) {
    var x = location[ 0 ];
    var y = location[ 1 ];
    self.activateNearbyEnemies( self, x, y );
  } )
  this.updateFog( this.playerX, this.playerY );
  this.enemyTurn();
}
WorldBoard.prototype.activateNearbyEnemies = function( self, inputx,
  inputy ) {
  var nearCells = this.nearbyCells( inputx, inputy );
  nearCells.forEach( function( ele, ind, arr ) {
    var x = ele[ 0 ];
    var y = ele[ 1 ];
    var creature = self.creatureLocs[ y ][ x ]
    if ( creature && creature.type !== "player" ) {
      if ( creature.isHunting === false )
        self.creatureAlertedPopup( x, y )
      self.creatureLocs[ y ][ x ].isHunting = true;
      self.ifHuntingAnimate( x, y );
    }
  } )
}
WorldBoard.prototype.popup = function( string, fontsize, color, x, y ) {
  var popupDiv = $( "<div></div>" );
  var popupName = "popup" + x + y
  popupDiv.text( string ).addClass( "atfront vtfont " + popupName )
    .css( {
      "color": color,
      "position": "absolute",
      "font-size": "0.4em",
      "width": "30px",
      "text-shadow": "black 0 0 0.25em"
    } )
  if ( !$( "." + popupName )[ 0 ] )
    this.makeRisingFadingDiv( x, y, popupDiv )
  else
    $( "." + popupName ).stop().append( "</br>" + string )
    .css( "opacity", "1" )
    .animate( {
      opacity: 0,
      bottom: "40px",
    }, 3000, "linear", function() {
      $( "." + popupName ).remove().css( "opacity", "1" )
    } )
}

WorldBoard.prototype.creatureAlertedPopup = function( x, y ) {
  var popupDiv = $( "<div></div>" );
  var popupName = "exclaimX" + x + "Y" + y;
  popupDiv.text( "!" ).addClass( "atfront vtfont " + popupName )
    .css( {
      "color": "red",
      "position": "absolute",
      "font-size": "2em",
      "width": "80px",
      "text-shadow": "black 0 0 0.5em"
    } );
  $( ".fogR" + y + "C" + x ).append( popupDiv );
  popupDiv.animate( {
    opacity: 0.5,
    bottom: "40px",
  }, 1000, "linear", function() {
    $( "." + popupName ).remove().css( "opacity", "1" )
  } )
}
WorldBoard.prototype.makeRisingFadingDiv =
  function( x, y, popupDiv ) {
    var popupName = "popup" + x + y
    $( ".fogR" + y + "C" + x ).append( popupDiv )
    popupDiv.animate( {
      opacity: 0.5,
      bottom: "40px",
    }, 3000, "linear", function() {
      $( "." + popupName ).remove().css( "opacity", "1" )
    } )
  }
WorldBoard.prototype.ifHuntingAnimate = function( x, y ) {
  var creature = this.creatureLocs[ y ][ x ]
  if ( creature && creature.isHunting === true )
    $( ".creatR" + y + "C" + x ).removeClass( "waiting" ).addClass(
      "hunting" )
}
WorldBoard.prototype.enemyTurn = function() {
  var self = this;
  this.creatureLocs.forEach( function( row, y ) {
    row.forEach( function( creature, x ) {
      if ( creature && creature.isHunting === true && creature.justMoved ===
        false ) {
        self.runEnemyAI( x, y )
      }
    } )
  } )
  this.creatureLocs.forEach( function( row, y ) {
    row.forEach( function( creature, x ) {
      if ( creature ) creature.justMoved = false;
      // reset moved status for all creatures.
    } )
  } )
}
WorldBoard.prototype.runEnemyAI = function( attackerX, attackerY ) {
  //every enemy that isHunting either moves towards player or attacks player
  enemy = this.creatureLocs[ attackerY ][ attackerX ];
  nearCells = this.nearbyCells( attackerX, attackerY );
  var self = this;
  var withinRange = false;
  nearCells.forEach( function( ele ) {
    var cellX = ele[ 0 ];
    var cellY = ele[ 1 ];
    if ( self.playerX === cellX && self.playerY === cellY ) {
      withinRange = true;
      self.attackOnPlayer( attackerX, attackerY );
    }
  } )
  if ( withinRange === false ) {
    this.moveTowardsPlayer( attackerX, attackerY );
  }
}
WorldBoard.prototype.attackOnPlayer = function( x, y ) {
  //arguments are for attacker position
  var attacker = this.creatureLocs[ y ][ x ];
  var player = this.creatureLocs[ this.playerY ][ this.playerX ];
  var playerTerrain = this.landTiles[ this.playerY ][ this.playerX ];
  var terrainDefenseMod = terrainDefenseVals[ playerTerrain ];
  var strengthCompare =
    minZero( attacker.strength - ( 0.5 * player.strength *
      terrainDefenseMod ) );
  var damageDone = minZero( genMax( strengthCompare + 1 ) );
  this.creatureLocs[ this.playerY ][ this.playerX ].health -= damageDone;
  var damageString = ""
  if ( damageDone === 0 ) {
    monstermiss.play()
    damageString = attacker.type + " misses!"
  } else {
    hit.play()
    damageString = attacker.type + " does " + damageDone + " damage!";
  }
  damageString = damageString.charAt( 0 ).toUpperCase() +
    damageString.slice( 1, damageString.length )
  this.popup( damageString, 0.5, "white", this.playerX, this.playerY )
  this.updateHealthDisplay();
  if ( player.health <= 0 ) {
    this.popup( "THE KNIGHT IS DEAD!", 0.5, "white", this.playerX, this.playerY )
    playerdeath.play();
    $( ".creatR" + this.playerY + "C" + this.playerX ).removeClass(
      "waiting" )
    $( ".fogR" + this.playerY + "C" + this.playerX ).addClass( "death" )
    $( ".health" ).css( "background-size", "100% 1000%" )
    $( ".strength" ).text( "DEAD!" )
    $( ".defense" ).text( "click to renew the cycle" )
    $( ".defense" ).click( function() {
      location.reload()
    } )
    this.creatureLocs[ this.playerY ][ this.playerX ] = null
    this.drawCreature( this.playerY, this.playerX )
  }
}
WorldBoard.prototype.attackByPlayer = function( player, targetX, targetY ) {
  var self = this
  var enemy = this.creatureLocs[ targetY ][ targetX ];
  this.activateNearbyEnemies( self, this.playerX, this.playerY );
  var enemyTerrain = this.landTiles[ targetY ][ targetX ];
  var terrainDefenseMod = terrainDefenseVals[ enemyTerrain ];
  var strengthCompare =
    minZero( player.strength - ( 0.5 * enemy.strength *
      terrainDefenseMod ) );
  var damageString = ""
  var damageDone = ( genMax( strengthCompare + 2 ) );
  if ( damageDone === 0 ) {
    heromiss.play();
    damageString = "Knight misses!"
  } else {
    hit.play();
    damageString = "Knight does " + damageDone + " damage!";
  }
  this.popup( damageString, 0.5, "white", targetX, targetY )
  this.creatureLocs[ targetY ][ targetX ].health -= damageDone;
  if ( enemy.health <= 0 ) {
    monsterdeath.play()
    this.popup( "DEFEATED!", 0.5, "white", targetX, targetY )
    var goldDrop = genRange( enemy.treasureMin, enemy.treasureMax );
    player.gold += goldDrop;
    player.xp += Math.floor( 10 * ( enemy.strength * this.xpScale ) )
    this.checkForLevelUp( player )
    this.creatureLocs[ targetY ][ targetX ] = null;
    this.drawCreature( targetX, targetY )
    this.updateSkillDisplay();
  }
}
WorldBoard.prototype.updateHealthDisplay = function() {
  var player = this.creatureLocs[ this.playerY ][ this.playerX ]
  var healthFraction = player.health / player.maxHealth
  var firePosition = healthFraction * 2
  $( ".health" ).css( "background-position", "0px -" + firePosition +
      "em" )
    .text( "Vitality: " + player.health + "/" + player.maxHealth )
}
WorldBoard.prototype.checkForLevelUp = function( player ) {
  if ( player.xp > player.xpToNextLevel ) {
    levelup.play()
    player.strength += 1;
    player.maxHealth += 4;
    var healing = Math.floor( ( player.maxHealth - player.health ) / 2 )
    player.health += healing;
    player.xpPrevLevel = player.xpToNextLevel
    player.xpToNextLevel = this.getXpNeededForLevel( player.strength )
    this.updateHealthDisplay();
    this.updateSkillDisplay();
    this.popup( "LEVEL UP!", 0.5, "white", this.playerX, this.playerY )
    var levelupDiv = $( "<div></div>" )
    $( ".fogR" + this.playerY + "C" + this.playerX ).append( levelupDiv )
    levelupDiv.addClass( "levelup" )
    levelupDiv.animate( {
      opacity: 1
    }, 3000, "linear", function() {
      $( ".levelup" ).remove()
    } )
  }
}
WorldBoard.prototype.getXpNeededForLevel = function( strength ) {
  return difficulty * factorial( strength )
}
WorldBoard.prototype.updateSkillDisplay = function() {
  var player = this.creatureLocs[ this.playerY ][ this.playerX ];
  firstColor = parseInt( 255 - ( 255 * player.strength / 20 ) );
  secondColor = parseInt( 255 * player.strength / 20 );
  xpFraction = ( player.xp - player.xpPrevLevel ) / player.xpToNextLevel
  xpBkgrndPosition = 1.6 - ( 1.6 * xpFraction );
  gradientString = "linear-gradient(rgba(255,255," +
    firstColor + ",1),rgba(0,0," + secondColor + ",1))"
  bkString = "0 " + xpBkgrndPosition + "em"
  $( ".strength" ).text( "Level " + player.strength )
  $( ".strength" ).css( "background", gradientString )
  $( ".strength" ).css( "background-position", bkString )
}
WorldBoard.prototype.updateDefenseDisplay = function() {
  var location = this.landTiles[ this.playerY ][ this.playerX ]
  var defenseColor, defenseString
  switch ( location ) {
    case "plain":
      defenseString = "Plains - normal defense"
      defenseColor = "green"
      break
    case "mountain":
      defenseString = "Mountains - great defense"
      defenseColor = "blue"
      break
    case "forest":
      defenseString = "Forest - good defense"
      defenseColor = "purple"
      break
    case "swamp":
      defenseString = "Swamp - poor defense"
      defenseColor = "red"
      break
  }
  $( ".defense" ).text( defenseString )
  $( ".defense" ).css( "backgroundColor", defenseColor )
}
WorldBoard.prototype.moveTowardsPlayer = function( x, y ) {
  //parameters are coordinates for creature location
  var moveChoice = "";
  var xDiff = x - this.playerX;
  var yDiff = y - this.playerY;
  if ( xDiff >= 0 && yDiff > 0 ) moveChoice = "NW"
  if ( xDiff < 0 && yDiff > 0 ) moveChoice = "NE"
  if ( xDiff >= 0 && yDiff < 0 ) moveChoice = "SW"
  if ( xDiff < 0 && yDiff < 0 ) moveChoice = "SE"
  if ( xDiff < 0 && yDiff === 0 ) moveChoice = "E"
  if ( xDiff > 0 && yDiff === 0 ) moveChoice = "W"
  var targetCell = this.cellInDirection( moveChoice, x, y );
  var targetY = targetCell[ 1 ];
  var targetX = targetCell[ 0 ];
  var targetTerrain = this.landTiles[ targetY ][ targetX ];
  var movement = this.creatureLocs[ y ][ x ].movement
  if ( targetY > -1 && targetX > -1 && targetY < this.height && targetX <
    this.width )
    if ( !this.creatureLocs[ targetY ][ targetX ] )
      if ( this.canMoveOnTerrain( movement, targetTerrain ) ) {
        this.creatureLocs[ targetY ][ targetX ] = this.creatureLocs[ y ]
              [
              x ];
        this.creatureLocs[ targetY ][ targetX ].justMoved = true;
        this.creatureLocs[ y ][ x ] = null;
        this.drawCreatures();
      }
}