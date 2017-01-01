// when accessing array or HTML : y first, then x (including R-Y-C-X on classes)
// when passing arguments to function or two-element array : x first, then y

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
  //for drawing sprite
  eagle:      [ 2, "fly", 2, 3, 0, 3, 6, 5, 15 ],
  goblin:     [ 3, "walk", 3, 1, 2, 4, 4, 2, 15 ],
  dog:        [ 2, "walk", 3, 2, 0, 3, 7, 3, 20 ],
  deathrose:  [ 5, "walk", 5, 1, 3, 5, 5, 3, 20 ],
  poltergeist:[ 6, "fly", 6, 1, 3, 5, 2, 1, 25 ],
  gargoyle:   [ 7, "fly", 7, 1, 3, 5, 4, 1, 30 ],
  windgoblin: [ 8, "fly", 8, 1, 3, 5, 7, 2, 35 ],
  zombie:     [ 9, "walk", 9, 1, 3, 5, 5, 2, 40 ],
  nightmare:  [ 10, "walk", 10, 1, 3, 5, 9, 2, 45 ],
  skeleknight:[ 11, "walk", 11, 1, 3, 5, 4, 3, 50 ],
  basilisk   :[ 12, "walk", 12, 1, 3, 5, 9, 3, 55 ],
  acidmound  :[ 13, "walk", 13, 1, 3, 5, 1, 4, 60 ],
  crystalcrab:[ 14, "walk", 14, 1, 3, 5, 3, 4, 65 ],
  greatsnake :[ 15, "walk", 15, 1, 3, 5, 7, 4, 70 ],
  hotgolem:   [ 16, "walk", 16, 1, 3, 5, 3, 5, 75 ],
  wingsting:  [ 17, "fly", 17, 1, 3, 5, 2, 2, 80 ],
  supergoblin:[ 18, "walk", 18, 1, 3, 5, 5, 6, 85 ],
  treant     :[ 19, "walk", 19, 1, 3, 5, 7, 6, 90 ],
  blackreaper:[ 20, "walk", 20, 1, 3, 5, 1, 5, 95 ],


}

var numbSeed = 0
  // this number will change every time genNumbSeed is called


//REPEATABLE RANDOM GENERATION
function genNum() {
  //every time this function is called it will both 
  // replace global numbSeed value as well as
  // return the new numbSeed value
  var x = Math.sin( numbSeed++ ) * 10000;
  numbSeed = x - Math.floor( x );
  return numbSeed
}

function genInt( max ) {
  //uses genNum to return an integer between 0 and max, 
  //including 0 and excluding max
  return Math.floor( genNum() * ( max ) );
}

function genRange( min, max ) {
  //uses genNum to return an integer in range, 
  //including min and excluding max
  return Math.floor( genInt( max - min ) + min );
}
//CUSTOM ARRAY TOOL

function areCoordsSame( array1, array2 ) {
  //compares two arrays which have 2 elements each and returns true if arrays are identical
  if ( array1[ 0 ] !== array2[ 0 ] ) return false
  if ( array1[ 1 ] !== array2[ 1 ] ) return false
  return true
}

//PLAYER CONSTRUCTOR
function Player( name ) {
  this.name = name
  this.type = "player"
  this.health = 15
  this.movement = "walk"
  this.strength = 3
  this.speed = 1
  this.gold = 10
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
  this.isHunting = false
}

//WORLDBOARD CONSTRUCTOR
function WorldBoard( width, height ) {
  this.playerX = 1;
  this.playerY = 1;
  this.height = height;
  this.width = width;
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
  this.noFogZone = []; // stores the last known noFogZone as a list of coords
  this.oldNoFogZone = []; //stores the old zone to clear after each step
}
WorldBoard.prototype.makeBlankBoardHtml = function () {
  var gameBoard = $( "<div></div" );
  gameBoard.addClass( "gameBoard" )
  this.landTiles.forEach( function ( row, rowidx ) {
    row.forEach( function ( tile, colidx ) {
      var landCell = $( "<div></div>" );
      var creatureCell = $( "<div></div>" );
      var fogCell = $( "<div></div>)" );
      landCell.addClass(
        "landbox landR" + rowidx + "C" + colidx );
      creatureCell.addClass(
        "creatbox creatR" + rowidx + "C" + colidx );
      fogCell.addClass(
        "fogbox fogR" + rowidx + "C" + colidx + " fog" );
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
  $( "body" ).append( gameBoard )
}
WorldBoard.prototype.drawTerrain = function () {
  this.landTiles.forEach( function ( row, rowidx ) {
    row.forEach( function ( tile, colidx ) {
      var xpos = landTilesCoords[ tile ][ 0 ];
      var ypos = landTilesCoords[ tile ][ 1 ];
      var posString = xpos + "px " + ypos + "px";
      $( ".landR" + rowidx + "C" + colidx ).css( "background-position", posString );
    } );
  } );
}
WorldBoard.prototype.randomizeTerrain = function () {
  var x = this.width;
  var y = this.height;
  var tilesNumber = x * y;
  this.landTiles.forEach( function ( row, rowidx, arr ) {
    row.forEach( function ( tile, colidx, row ) {
      arr[ rowidx ][ colidx ] = "plain" //initialize all as plain
    } )
  } )
  var swampTiles = Math.floor( tilesNumber / 4 );
  var forestTiles = Math.floor( tilesNumber / 3 );
  var mountainTiles = Math.floor( tilesNumber / 5 );
  var waterTiles = Math.floor( tilesNumber / 2 );
  for ( var i = 0; i < waterTiles; i++ )
    this.landTiles[ genInt( y ) ][ genInt( x ) ] = "water";
  for ( var i = 0; i < swampTiles; i++ )
    this.landTiles[ genInt( y ) ][ genInt( x ) ] = "swamp";
  for ( var i = 0; i < forestTiles; i++ )
    this.landTiles[ genInt( y ) ][ genInt( x ) ] = "forest";
  for ( var i = 0; i < mountainTiles; i++ )
    this.landTiles[ genInt( y ) ][ genInt( x ) ] = "mountain";
}
WorldBoard.prototype.randomizeCreatures = function () {
  //name:[health,movement,strength,speed,treasureMin,treasureMax,spriteX,spriteY]
  //sprite X and Y are in 1-index
  var self = this
  for ( creatureType in creatureTypes ) {
    var maxY = this.height;
    var maxX = this.width;
    var tilesNumber = maxX * maxY;
    noOfMonster = Math.floor( tilesNumber / creatureTypes[ creatureType ][ 8 ] );
    for ( var i = 0; i < noOfMonster; i++ ) {
      this.makeACreature( self, creatureType )
    }
  }
}
WorldBoard.prototype.makeACreature =
  function ( self, creatureType ) {
    // creates one new creature at position given if allowed
    var xpos = genInt( this.width );
    var ypos = genInt( this.height );
    var terrainHere = self.landTiles[ ypos ][ xpos ];
    var movement = creatureTypes[ creatureType ][ 1 ];
    var strength = creatureTypes[ creatureType ][ 2 ];
    if ( !( movement === "walk" && terrainHere === "water" ) )
      if ( !( movement === "fly" && terrainHere === "forest" ) )
        if ( !( xpos === 1 && ypos === 1 ) )
          if ( xpos > strength - 4 && ypos > strength - 4 ) 
            if ( xpos < strength + 10 && ypos < strength +10 ){
            this.creatureLocs[ ypos ][ xpos ] =
              new Creature( creatureType, creatureTypes[ creatureType ] );
            return
          }
    self.makeACreature( self, creatureType ) //if fail, run makeACreature again
  }
WorldBoard.prototype.drawCreatures = function () {
  //deletes creatures in oldNoFogZone, then draws creatures in noFogZone
  var self = this;
  this.oldNoFogZone.forEach( function ( ele, ind, arr ) {
    var x = ele[ 0 ]
    var y = ele[ 1 ]
    $( ".creatR" + y + "C" + x ).removeClass( "creature" )
  } )
  this.noFogZone.forEach( function ( ele, ind, arr ) {
    var x = ele[ 0 ]
    var y = ele[ 1 ]
    self.drawCreature( x, y )
  } )

}
WorldBoard.prototype.drawCreature = function ( x, y ) {
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
      .css( "background-position", posString );
  }
}
WorldBoard.prototype.initPlayer = function ( playerName ) {
  this.creatureLocs[ 1 ][ 1 ] = new Player( playerName )
  this.updateFog()
}
WorldBoard.prototype.updateFog = function () {
  var noFogZone = this.calculateNoFogZone( this.playerX, this.playerY )
  this.landTiles.forEach( function ( row, rowidx ) {
    row.forEach( function ( tile, colidx ) {
      $( ".fogR" + rowidx + "C" + colidx ).addClass( "fog" );
    } )
  } )
  noFogZone.forEach( function ( ele ) {
    var x = ele[ 0 ];
    var y = ele[ 1 ];
    $( ".fogR" + y + "C" + x ).removeClass( "fog" )
    $( ".landR" + y + "C" + x ).addClass( "background" )
  } )
  this.oldNoFogZone = this.noFogZone
  this.noFogZone = noFogZone;
  this.drawCreatures();
}
WorldBoard.prototype.calculateNoFogZone = function ( playerX, playerY ) {
  //calculates a two-cell range around the player location
  //that should be non-foggy
  var self = this
  var noFogCore = this.nearbyCells( playerX, playerY );
  var noFogZone = [];
  noFogCore.forEach( function ( ele ) {
    var x = ele[ 0 ];
    var y = ele[ 1 ];
    noFogZone = noFogZone.concat( self.nearbyCells( x, y ) )
  } )
  return noFogZone
}
WorldBoard.prototype.nearbyCells = function ( x, y ) {
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
  var filteredForOutsideBoard = hexArray.filter( function ( coords ) {
    return coords[ 0 ] > -1 && coords[ 1 ] > -1 &&
      coords[ 0 ] < self.width && coords[ 1 ] < self.height;
  } )
  return filteredForOutsideBoard;
}
WorldBoard.prototype.validMoves = function ( movement, x, y ) {
  //checks all grid locations around x,y for valid moves
  //returns an array with each location a pair in an array
  var self = this;
  var cellsToCheck = this.nearbyCells( x, y );
  var validMoves = [];
  if ( movement === "walk" ) {
    validMoves = cellsToCheck.filter( function ( ele, ind, arr ) {
      var x = ele[ 0 ];
      var y = ele[ 1 ];
      return ( self.landTiles[ y ][ x ] !== "water" )
    } )
  }
  if ( movement === "fly" ) {
    validMoves = cellsToCheck.filter( function ( ele, ind, arr ) {
      var x = ele[ 0 ];
      var y = ele[ 1 ];
      return ( self.landTiles[ y ][ x ] !== "forest" )
    } )
  }
  return validMoves;
}
WorldBoard.prototype.cellInDirection = function ( direction, x, y ) {
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
WorldBoard.prototype.playerMove = function ( direction ) {
  //checks if player can move to cell in direction, and if so moves him
  //need to update this.playerX, this.playerY, and creatureLocs as well
  //returns true if an action was performed(move or attack)
  var self = this
  var x = this.playerX;
  var y = this.playerY;
  var targetCell = this.cellInDirection( direction, x, y );
  var targetX = targetCell[ 0 ];
  var targetY = targetCell[ 1 ];
  var player = this.creatureLocs[ y ][ x ];
  var validMoves = this.validMoves( player.movement, x, y );
  var isMoveValid = false;
  validMoves.forEach( function ( ele ) {
    if ( targetX === ele[ 0 ] && targetY === ele[ 1 ] ) {
      isMoveValid = true;
    }
  } )
  if ( isMoveValid && self.creatureLocs[ targetY ][ targetX ] === null ) {
    //move to empty square
    this.playerX = targetX;
    this.playerY = targetY;
    this.creatureLocs[ targetY ][ targetX ] = self.creatureLocs[ y ][ x ];
    this.creatureLocs[ y ][ x ] = null;
    this.drawCreature( x, y ); // clear old cell
    this.drawCreature( targetX, targetY ); // draw at new cell
    this.updateFog( targetX, targetY )
    this.enemyTurn( player, targetX, targetY )
    return true
  }
  if ( isMoveValid && self.creatureLocs[ targetY ][ targetX ] !== null ) {
    this.attackByPlayer( player, targetX, targetY )
    this.enemyTurn( player, targetX, targetY )
    return true
  }
  return false
}
WorldBoard.prototype.attackByPlayer = function ( player, targetX, targetY ) {
  var self = this
  var enemy = this.creatureLocs[ targetY ][ targetX ];
  this.activateNearbyEnemies( self, this.playerX, this.playerY );
  strengthDifference = player.strength - 0.5 * enemy.strength;
  damageDone = genInt( strengthDifference + 1 );
  this.creatureLocs[ targetY ][ targetX ].health -= damageDone;
  console.log( "damage done:", damageDone );
  console.log( "enemy health:", enemy.health );
  if ( enemy.health <= 0 ) {
    console.log( enemy.type, "has succumbed to its wounds and collapsed." );
    console.log( "treasure calc: ", enemy.treasureMin, enemy.treasureMax )
    var goldDrop = genRange( enemy.treasureMin, enemy.treasureMax );
    console.log( enemy.type, "has", goldDrop, "gold pieces on its body" );
    player.gold += goldDrop;
    console.log( "The player now has", player.gold, "gold coins." )
    this.creatureLocs[ targetY ][ targetX ] = null;
    this.drawCreature( targetX, targetY );
  }
}
WorldBoard.prototype.activateNearbyEnemies = function ( self, x, y ) {
  // tested
  var nearCells = self.nearbyCells( x, y );
  nearCells.forEach( function ( ele, ind, arr ) {
    var x = ele[ 0 ];
    var y = ele[ 1 ];
    if ( self.creatureLocs[ y ][ x ] ) {
      self.creatureLocs[ y ][ x ].isHunting = true;
    }
  } )
}
WorldBoard.prototype.enemyTurn = function () {
  var self = this;
  this.creatureLocs.forEach( function ( row, y ) {
    row.forEach( function ( creature, x ) {
      if ( creature && creature.isHunting === true )
        self.runEnemyAI( x, y )
    } )
  } )
}
WorldBoard.prototype.runEnemyAI = function ( attackerX, attackerY ) {
  //every enemy that isHunting either moves towards player or attacks player
  enemy = this.creatureLocs[ attackerY ][ attackerX ];
  nearCells = this.nearbyCells( attackerX, attackerY );
  var self = this;
  var withinRange = false
  nearCells.forEach( function ( ele ) {
    var cellX = ele[ 0 ];
    var cellY = ele[ 1 ];
    if ( self.playerX === cellX && self.playerY === cellY ) {
      withinRange = true
      self.attackOnPlayer( attackerX, attackerY )
    }
  } )
  if ( withinRange === false ) this.moveTowardsPlayer( attackerX, attackerY )

}
WorldBoard.prototype.attackOnPlayer = function ( x, y ) {
  var attacker = this.creatureLocs[ y ][ x ];
  var player = this.creatureLocs[ this.playerY ][ this.playerX ]
  strengthDifference = attacker.strength - 0.5 * player.strength;
  console.log( "strength difference is ", strengthDifference )
  damageDone = genInt( strengthDifference + 1 );
  this.creatureLocs[ this.playerY ][ this.playerX ].health -= damageDone;
  console.log( "damage done by attacker:", damageDone );
  console.log( "player health:", player.health );;
  if ( player.health <= 0 ) {
    console.log( "the player has died!!!" )
    this.creatureLocs[ this.playerY ][ this.playerX ] = null
    this.drawCreature( this.playerY, this.playerX )
  }
}
WorldBoard.prototype.drawFoglessMap = function () {
  //check all land/monster locations, used for debugging
  var self = this;
  this.landTiles.forEach( function ( row, rowindex ) {
    row.forEach( function ( tile, colindex ) {
      $( ".fogR" + rowindex + "C" + colindex ).removeClass( "fog" );
      $( ".landR" + rowindex + "C" + colindex ).addClass( "background" );
      self.drawCreature( colindex, rowindex );
    } )
  } )
}
WorldBoard.prototype.moveTowardsPlayer = function ( x, y ) {

}