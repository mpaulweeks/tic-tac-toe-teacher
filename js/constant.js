
var codeDocs = (
`// board gives you access to the current game state
board.freeSquares;
board.mySquares;
board.opponentSquares;

// square gives you ids of all 9 squares
square.TopLeft;
square.TopCenter;
square.TopRight;
square.CenterLeft;
square.Center;
square.CenterRight;
square.BottomLeft;
square.BottomCenter;
square.BottomRight;

// example
if (board.freeSquares.includes(square.Center)){
    return square.Center;
}

// square also has lists of the corners and SIDES
square.CORNERS;
square.SIDES;

// api has a number of helper functions

api.checkForWin(squares);
// Takes in a list of squares
// Returns true/false is they contain a three-in-a-row

api.getRandom(squares);
// Takes in a list of squares
// Returns one at random
// Returns null if list is empty

api.intersect(squares1, squares2);
// Takes in two lists of squares
// Returns a new list containing the squares present in both lists

// example
var freeCorners = api.intersect(board.freeSquares, square.CORNERS);
`);
