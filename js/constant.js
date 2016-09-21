

var codeDocs = (
`
////////////////////
// board & square //
////////////////////

// board gives you access to the current game state
board.freeSquares;  // list of square ids
board.mySquares;
board.opponentSquares;

// square gives you the ids of all 9 squares
square.TopLeft;
square.TopCenter;
square.TopRight;
square.CenterLeft;
square.Center;
square.CenterRight;
square.BottomLeft;
square.BottomCenter;
square.BottomRight;

// example usage
if (board.freeSquares.includes(square.Center)){
    return square.Center;
}

// for convenience, square also has:
square.CORNERS;
square.SIDES;


/////////
// api //
/////////

// api provides a couple of helper functions


// Takes in a list of square ids
// Returns true/false is they contain a three-in-a-row
api.checkForWin(squares);

// example usage
var nextTurn = board.mySquares.concat(square.BottomRight);
if (api.checkForWin(nextTurn)){
    return square.BottomRight;
}


// Takes in a list of square ids
// Returns one at random
// Returns null if list is empty
api.getRandom(squares);

// Takes in two lists of square ids
// Returns a new list containing the squares present in both lists
api.intersect(squares1, squares2);

// example usage
var freeCorners = api.intersect(board.freeSquares, square.CORNERS);
var cornerMove = api.getRandom(freeCorners);
if (cornerMove != null){
    return cornerMove;
} else {
    // do something else
}
`);
