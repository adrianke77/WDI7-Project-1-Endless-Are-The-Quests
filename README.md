# WDI Unit 1 Game Projects
Two game projects are here, both as submissions for the General Assembly Web Developer Immersive full-time course Unit 1 project assignment.

The main folder is the Mini-RPG "Endless Are The Quests"; the chess game is in a subfolder.

### Prerequisites

No special prerequisites. Just follow How To Use below.

### How to Use

Git clone the repo, then opening the index.html in either game directory with your browser will start that game. 

Alternatively, Git Pages hosted copy is at 

adrianke77.github.io/wdi-7-project-1-adrianke77/

## Built With

Besides vanilla JS, html and CSS :

* [jQuery](http://jquery.com/)

## Interesting problems solved(in case anyone is interested):

It was difficult to have a reasonable way to have popup damage/miss messages show up over character and monster heads. They tended to overwrite/occlude each other, even appending to the existing popup might result it it appearing a split second before the div disappears. The solution used was that if another popup triggers while a popup exists, it resets opacity to 1, appends the text and restarts the animation. Else it makes a new popup. Done in Jquery .animate.

The hex grid makes it more complicated to target nearby cells, as simply adding/subtracting from x and y would not work like a square grid. Every cell has six connections instead of four. The solution was to write a function that returns the target cell for a direction given.

The fogzone and the shout area both depend on reaching every direction in two hexes. For this purpose and also for other uses, there is a function nearbyCells() that takes a cell and returns the six neighbouring cells in an array. Running nearbyCells again on aech item in the returned array and concatting produces every cell in a two hex radius.

 If 

## Authors

Adrian Ke



## Acknowledgments

[the repeatable random number generator used in the Mini-Rpg project is from this answer on the StackOverflow page](http://stackoverflow.com/a/19303725).
