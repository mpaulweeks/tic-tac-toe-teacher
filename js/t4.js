
var boardFactory = function () {
    var self = {};

    var api = (function(){
        var self = {};
        var winningBlocks = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
            [1, 4, 7],
            [2, 5, 8],
            [3, 6, 9],
            [1, 5, 9],
            [3, 5, 7],
        ];

        function containsSubArray(array, subarray) {
            var si = 0;
            var contains = false;
            array.forEach(function (val) {
                if (val === subarray[si]) {
                    si++;
                    if (si === subarray.length) {
                        contains = true;
                    }
                }
            });
            return contains;
        }

        self.checkForWin = function(blocks) {
            blocks.sort();
            var winningMove = null;
            winningBlocks.forEach(function (subarray) {
                if(!winningMove && containsSubArray(blocks, subarray)){
                    winningMove = subarray;
                }
            });
            return winningMove;
        };

        self.getRandom = function(arr){
            if (!arr || arr.length == 0){
                return null;
            }
            return arr[Math.floor(Math.random() * arr.length)];
        };

        self.intersect = function(arr1, arr2){
            return arr1.filter(function(n) {
                return arr2.indexOf(n) != -1;
            });
        };

        return self;
    })();

    var blockPictures = [
        'img/block_x.png',
        'img/block_o.png'
    ];
    var currentPlayerId = null;  // either 0 or 1
    var playerBrains = null;  // list of len 2
    var robotTimeout = null;
    var gameOverCallback = null;
    var emptyBlockPid = 2;
    var grid = {};
    var gameOver = null;
    var drawGame = null;
    var inputDisabled = true;

    function resetGrid() {
        grid = [];
        for (var i = 1; i <= 9; i++) {
            grid[i] = emptyBlockPid;
        }
    }

    function makeMove(clickedBlock) {
        if (grid[clickedBlock] == emptyBlockPid) {
            grid[clickedBlock] = currentPlayerId;
            return true;
        }
        return false;
    }

    function getOwnedBlocks(pid) {
        var ownedBlocks = [];
        for (var i = 1; i <= 9; i++) {
            if (i in grid && grid[i] == pid) {
                ownedBlocks.push(i);
            }
        }
        return ownedBlocks;
    }

    function getOpponentId() {
        return 1 - currentPlayerId;
    }

    function getCurrentPlayer() {
        return playerBrains[currentPlayerId];
    }

    // view stuff
    function switchPlayer() {
        currentPlayerId = getOpponentId();
        startTurn();
    }

    function resetGame() {
        currentPlayerId = 0;
        gameOver = false;
        drawGame = false;
        inputDisabled = false;
        resetGrid();
        for(var bid = 0; bid < grid.length; bid++){
            markBlock(bid, emptyBlockPid);
            $('#block-'+bid).removeClass('highlight');
        }
        displayMessage();
        startTurn();
    }

    function endTurn() {
        var blocks = getOwnedBlocks(currentPlayerId);
        var winningMove = api.checkForWin(blocks);
        if (winningMove) {
            winningMove.forEach(function(bid){
                $('#block-'+bid).addClass('highlight');
            });
            gameOver = true;
        }
        else if (getOwnedBlocks(emptyBlockPid).length == 0){
            gameOver = true;
            drawGame = true;
        } else {
            switchPlayer();
        }
        displayMessage();
        if (gameOver && gameOverCallback){
            gameOverCallback(getCurrentPlayer(), drawGame);
        }
    }

    function displayMessage(){
        var playerName = getCurrentPlayer().name;
        var message = playerName + "'s turn";
        if (drawGame){
            message = "Draw Game";
        } else if (gameOver) {
            message = playerName + " wins!";
        }
        $('#message').html(message);
    }

    function displayImage(elm, pid) {
        var url = blockPictures[pid];
        elm.html('<img src="' + url + '" />');
    }

    function markBlock(blockId, pid) {
        var block = $('#block-'+blockId);
        if(pid === emptyBlockPid){
            block.empty();
            block.removeClass('filled');
        }
        else{
            displayImage(block, pid);
            block.addClass('filled');
        }
    }

    function makeDto(){
        var dto = {};
        dto.freeSquares = getOwnedBlocks(emptyBlockPid);
        dto.mySquares = getOwnedBlocks(currentPlayerId);
        dto.opponentSquares = getOwnedBlocks(getOpponentId());
        return dto;
    }

    function startTurn(){
        var cp = getCurrentPlayer();
        if (cp.isRobot){
            setTimeout(function(){
                takeTurn(cp.move(makeDto(), api));
            }, robotTimeout);
        } else {
            // human turn: do nothing, wait for click event
            inputDisabled = false;
        }
    }

    function takeTurn(blockId){
        var success = makeMove(blockId);
        if (success) {
            markBlock(blockId, currentPlayerId);
            inputDisabled = true;
            endTurn();
        }
    }

    $('#reset').on('click', resetGame);
    $('.block').on('click', function () {
        if(gameOver || inputDisabled){
            // do nothing, wait for manual reset
        }
        else{
            var blockId = $(this).data('id');
            takeTurn(blockId);
        }
    });

    self.loadBrains = function(brain1, brain2, timeout, callback){
        brain1 = brain1 || humanBrain;
        brain2 = brain2 || humanBrain;
        playerBrains = [brain1, brain2];
        robotTimeout = timeout || 500;
        gameOverCallback = callback;
        resetGame();
    };
    return self;
};

var humanBrain = {
    name: "Human",
    isRobot: false,
};

var robotFactory = function(robotFuncText, robotName){
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

    return self;
}

var simpleRobot = robotFactory(
`if (board.freeSquares.includes(square.Center)){
    return square.Center;
}
return api.getRandom(board.freeSquares);
`, "Simple Robot");

var mediumRobot = robotFactory(
`function determineWinningMoves(freeSquares, mySquares){
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
);`, "Medium Robot");

var expertRobot = robotFactory(
`function determineWinningMoves(freeSquares, mySquares){
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
);`, "Expert Robot");

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

function ticTacToe(){
    var editorCode = ace.edit("editor-code");
    var editorStart = ace.edit("editor-start");
    var editorEnd = ace.edit("editor-end");
    var editorDocs = ace.edit("editor-docs");
    [editorStart, editorEnd, editorDocs].forEach(function (editor){
        editor.setReadOnly(true);
    });
    [editorCode, editorStart, editorEnd, editorDocs].forEach(function (editor){
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/javascript");
        editor.$blockScrolling = Infinity;
    });
    [editorStart, editorEnd].forEach(function (editor){
        editor.getSession().setMode("ace/mode/text");
    });
    editorStart.setValue('function determineRobotMove(board, api, square) {', -1);
    editorEnd.setValue('}', -1);
    editorDocs.setValue(codeDocs, -1);

    var game = boardFactory();

    function loadRobot(robot){
        if (robot.code != editorCode.getValue()){
            editorCode.setValue(robot.code, -1);
        }
        if(parseInt($('#settings input[name=turn]:checked').val()) == 0){
            game.loadBrains(robot, humanBrain);
        } else {
            game.loadBrains(humanBrain, robot);
        }
    }
    $('#run').click(function (){
        var code = editorCode.getValue();
        var robot = robotFactory(code);
        loadRobot(robot);
    });
    $('#load-simple').click(function(){
        loadRobot(simpleRobot);
    });
    $('#load-medium').click(function(){
        loadRobot(mediumRobot);
    });
    $('#load-expert').click(function(){
        loadRobot(expertRobot);
    });
    loadRobot(simpleRobot);
    // game.loadBrains(simpleRobot, expertRobot, 1);

    function exportGist(){
        var data = {
            "description": "posting gist test",
            "public": false,
            "files": {
                "test.txt": {
                    "content": editorCode.getValue(),
                }
            }
        };
        $.ajax({
            url: 'https://api.github.com/gists',
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(data)
        }).success( function(e) {
            console.log(e);
        }).error( function(e) {
            console.warn("gist save error", e);
        });
    }
    $('#export-gist').click(exportGist);
}
