
var presetRobots = [];
var robotFactory = function(robotName, isVisible, robotFuncText){
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
  self.name = robotName || 'Custom Robot';
  self.id = self.name.toLowerCase().replace(" ", "-");
  if (robotName){
    presetRobots.push(self);
  }
  self.isVisible = isVisible || Tool.readUrlParam("debug") || false;
  return self;
}

var createCustomRobot = function(code){
   return robotFactory(undefined, undefined, code);
}

var simpleRobot = robotFactory("Simple Robot", true, `
if (board.freeSquares.includes(square.Center)){
  return square.Center;
}
return api.getRandom(board.freeSquares);
`);

var mediumRobot = robotFactory("Obvious Robot", true, `
function determineWinningMoves(mySquares){
  var winningMoves = [];
  for (var i = 0; i < board.freeSquares.length; i++){
    var hypoMove = board.freeSquares[i];
    var hypoSquares = mySquares.concat(hypoMove);
    if (api.checkForWin(hypoSquares)){
      winningMoves.push(hypoMove);
    }
  }
  return winningMoves;
}
return (
  api.getRandom(determineWinningMoves(board.mySquares)) ||
  api.getRandom(determineWinningMoves(board.opponentSquares)) ||
  api.getRandom(board.freeSquares)
);
`);

var expertRobot = robotFactory("Clever Robot", false, `
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
`);

var perfectRobot = robotFactory("Flawless Robot", false, `
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
function getRandomFree(choices){
  return api.getRandom(
    api.intersect(choices, board.freeSquares)
  );
}
function equiv(list1, list2){
  return (
    list1.length == list2.length &&
    api.intersect(list1, list2).length == list1.length
  );
}

var move = (
  getRandomFree(determineWinningMoves(board.freeSquares, board.mySquares)) ||
  getRandomFree(determineWinningMoves(board.freeSquares, board.opponentSquares))
);
if (move){
  return move;
}

var countMoves = 9 - board.freeSquares.length;
switch (countMoves){
  case 0:
    move = square.Center;
    break;
  case 2:
    var oppMove = board.opponentSquares[0];
    var res = {};
    res[square.TopCenter] = [square.BottomLeft, square.BottomRight];
    res[square.BottomCenter] = [square.TopLeft, square.TopRight];
    res[square.CenterLeft] = [square.TopRight, square.BottomRight];
    res[square.CenterRight] = [square.BottomLeft, square.TopLeft];
    res[square.TopLeft] = [square.BottomRight];
    res[square.TopRight] = [square.BottomLeft];
    res[square.BottomLeft] = [square.TopRight];
    res[square.BottomRight] = [square.TopLeft];
    move = getRandomFree(res[oppMove]);
    break;
  case 4:
    move = getRandomFree(determinePincerMoves(board.freeSquares, board.mySquares));
    break;
  case 1:
    var oppMove = board.opponentSquares[0];
    if (oppMove == square.Center){
      move = getRandomFree(square.CORNERS);
    } else {
      move = square.Center;
    }
    break;
  case 3:
    var myMove = board.mySquares[0];
    var oppCornerCount = api.intersect(board.opponentSquares, square.CORNERS).length;
    if (myMove == square.Center){
      switch(oppCornerCount){
        case 2:
          move = getRandomFree(square.SIDES);
          break;
        case 1:
          var oppCorner = api.intersect(board.opponentSquares, square.CORNERS)[0];
          var res = {};
          res[square.TopLeft] = [square.BottomRight];
          res[square.TopRight] = [square.BottomLeft];
          res[square.BottomLeft] = [square.TopRight];
          res[square.BottomRight] = [square.TopLeft];
          move = getRandomFree(res[oppCorner]);
          break;
        case 0:
          if (equiv(board.opponentSquares, [square.TopCenter, square.CenterLeft])){
            move = square.TopLeft;
          } else if (equiv(board.opponentSquares, [square.TopCenter, square.CenterRight])){
            move = square.TopRight;
          } else if (equiv(board.opponentSquares, [square.BottomCenter, square.CenterLeft])){
            move = square.BottomLeft;
          } else if (equiv(board.opponentSquares, [square.BottomCenter, square.CenterRight])){
            move = square.BottomRight;
          }
          break;
      }
    } else {
      move = getRandomFree(square.CORNERS);
    }
    break;
}

return move || api.getRandom(board.freeSquares);
`);
