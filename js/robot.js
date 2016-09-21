
var presetRobots = [];
var robotFactory = function(robotFuncText, robotName, isVisible){
    var self = {};

    var SQUARE = {
        TopLeft: 1,
        TopCenter: 2,
        TopRight: 3,
        CenterLeft: 4,
        Center: 5,
        CenterRight: 6,
        BottomLeft: 7,
        BottomCenter: 8,
        BottomRight: 9,
    };
    SQUARE.CORNERS = [
        SQUARE.TopLeft,
        SQUARE.TopRight,
        SQUARE.BottomLeft,
        SQUARE.BottomRight,
    ];
    SQUARE.SIDES = [
        SQUARE.TopCenter,
        SQUARE.CenterLeft,
        SQUARE.CenterRight,
        SQUARE.BottomCenter,
    ];

    var robotMover = new Function('board', 'api', 'square', robotFuncText);
    self.move = function(board, api){
        return robotMover(board, api, SQUARE);
    }

    self.code = robotFuncText;
    self.isRobot = true;
    self.name = robotName || "Custom Robot";
    self.id = self.name.toLowerCase().replace(" ", "-");
    if (robotName){
        presetRobots.push(self);
    }
    self.isVisible = isVisible || false;
    return self;
}

var simpleRobot = robotFactory(
`
if (board.freeSquares.includes(square.Center)){
    return square.Center;
}
return api.getRandom(board.freeSquares);
`, "Simple Robot", true);

var mediumRobot = robotFactory(
`
function determineWinningMoves(freeSquares, mySquares){
    var winningMoves = [];
    for (var i = 0; i < freeSquares.length; i++){
        var hypoMove = freeSquares[i];
        var hypoSquares = mySquares.concat(hypoMove);
        if (api.checkForWin(hypoSquares)){
            winningMoves.push(hypoMove);
        }
    }
    return winningMoves;
}
return (
    api.getRandom(determineWinningMoves(board.freeSquares, board.mySquares)) ||
    api.getRandom(determineWinningMoves(board.freeSquares, board.opponentSquares)) ||
    api.getRandom(board.freeSquares)
);
`, "Medium Robot", true);

var expertRobot = robotFactory(
`
function determineWinningMoves(freeSquares, mySquares){
    var winningMoves = [];
    for (var i = 0; i < freeSquares.length; i++){
        var hypoMove = freeSquares[i];
        var hypoSquares = mySquares.concat(hypoMove);
        if (api.checkForWin(hypoSquares)){
            winningMoves.push(hypoMove);
        }
    }
    return winningMoves;
}
function determinePincerMoves(freeSquares, mySquares){
    var pincerMoves = [];
    for (var i = 0; i < freeSquares.length; i++){
        var hypoMove = freeSquares[i];
        var hypoFreeSquares = (
            freeSquares.slice(0, i).concat(freeSquares.slice(i+1))
        );
        var hypoMySquares = mySquares.concat(hypoMove);
        if (determineWinningMoves(hypoFreeSquares, hypoMySquares).length >= 2){
            pincerMoves.push(hypoMove);
        }
    }
    return pincerMoves;
}
function checkFunc(determineFunc){
    return (
        api.getRandom(determineFunc(board.freeSquares, board.mySquares)) ||
        api.getRandom(determineFunc(board.freeSquares, board.opponentSquares))
    );
}
return (
    checkFunc(determineWinningMoves) ||
    checkFunc(determinePincerMoves) ||
    api.getRandom(api.intersect(board.freeSquares, [square.Center])) ||
    api.getRandom(api.intersect(board.freeSquares, square.CORNERS)) ||
    api.getRandom(board.freeSquares)
);
`, "Expert Robot", false);
