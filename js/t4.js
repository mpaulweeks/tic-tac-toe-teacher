
var boardFactory = function (robotBrain) {
    var self = {};

    var blockPictures = [
        'img/block_x.png',
        'img/block_o.png'
    ];
    var playerId = 0;  // either 0 or 1
    var emptyBlockPid = 2;
    var grid = [];
    var gameOver = false;
    var winningBlocks = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    var resetGrid = function () {
        grid = [];
        for (var i = 0; i < 9; i++) {
            grid.push(emptyBlockPid);
        }
    };

    var makeMove = function (clickedBlock) {
        if (grid[clickedBlock] == emptyBlockPid) {
            grid[clickedBlock] = playerId;
            return true;
        }
        return false;
    };

    var getOwnedBlocks = function (pid) {
        var ownedBlocks = [];
        for (var i = 0; i < grid.length; i++) {
            if (grid[i] == pid) {
                ownedBlocks.push(i);
            }
        }
        return ownedBlocks;
    };

    var containsSubArray = function (array, subarray) {
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
    };

    var didTheyJustWin = function () {
        return didTheyWinWithBlocks(getOwnedBlocks(playerId));
    };

    var didTheyWinWithBlocks = function (blocks) {
        blocks.sort();
        var winningMove = null;
        winningBlocks.forEach(function (subarray) {
            if(!winningMove && containsSubArray(blocks, subarray)){
                winningMove = subarray;
            }
        });
        return winningMove;
    };

    var getOpponentId = function() {
        return 1 - playerId;
    };

    var switchPlayer = function () {
        $('#turn-'+playerId).hide();
        playerId = getOpponentId();
        $('#turn-'+playerId).show();
    };

    // view stuff
    var resetGame = function () {
        resetGrid();
        $('#turn-0').hide();
        $('#turn-1').hide();
        $('#victory-0').hide();
        $('#victory-1').hide();
        for(var bid = 0; bid < grid.length; bid++){
            markBlock(bid, emptyBlockPid);
            $('#block-'+bid).removeClass('highlight');
        }

        $('#turn-'+playerId).show();
        gameOver = false;

        startTurn();
    };

    var checkForWin = function () {
        var winningMove = didTheyJustWin();
        if (winningMove) {
            $('#turn-' + playerId).hide();
            $('#victory-' + playerId).show();
            winningMove.forEach(function(bid){
                $('#block-'+bid).addClass('highlight');
            });
            gameOver = true;
        }
        else {
            switchPlayer();
            startTurn();
        }
    };

    var displayImage = function(elm, pid) {
        var url = blockPictures[pid];
        elm.html('<img src="' + url + '" />');
    }

    var markBlock = function(blockId, pid) {
        var block = $('#block-'+blockId);
        if(pid === emptyBlockPid){
            block.empty();
            block.removeClass('filled');
        }
        else{
            displayImage(block, pid);
            block.addClass('filled');
        }
    };

    function makeDto(){
        var dto = {};
        dto.freeSquares = getOwnedBlocks(emptyBlockPid);
        dto.mySquares = getOwnedBlocks(playerId);
        dto.opponentSquares = getOwnedBlocks(getOpponentId());
        return dto;
    }

    var startTurn = function(){
        if (playerId == robotBrain.id){
            // todo: disable click events, wait 1 second, re-enable events
            takeTurn(robotBrain.move(makeDto()));
        } else {
            // human turn: do nothing, wait for click event
        }
    }

    var takeTurn = function(blockId){
        var success = makeMove(blockId);
        if (success) {
            markBlock(blockId, playerId);
            checkForWin();
        }
    }

    $('#reset').on('click', resetGame);
    $('.block').on('click', function () {
        if(gameOver){
            // do nothing
        }
        else{
            var blockId = $(this).data('id');
            takeTurn(blockId);
        }
    });

    self.reset = resetGame;
    return self;
};

// function determineMove(board, square){
var sampleRobot = `
    console.log(square.Center);
    if (board.freeSquares.includes(square.Center)){
        return square.Center;
    }
    return api.getRandom(board.freeSquares);
`;

var robotFactory = function(robotFuncText){
    var self = {};

    var api = (function(){
        var self = {};

        self.getRandom = function(arr){
            return arr[Math.floor(Math.random() * arr.length)];
        };

        return self;
    })();

    var SQUARE = {
        TopLeft: 0,
        TopCenter: 1,
        TopRight: 2,
        CenterLeft: 3,
        Center: 4,
        CenterRight: 5,
        BottomLeft: 6,
        BottomCenter: 7,
        BottomRight: 8,
    };

    var robotMover = new Function('board', 'api', 'square', robotFuncText);

    self.move = function(board){
        return robotMover(board, api, SQUARE);
    }
    self.id = Math.floor(Math.random() * 2);

    return self;
}

function ticTacToe(){
    function loadAI(){
        var robot = robotFactory(sampleRobot);
        var board = boardFactory(robot);
        board.reset();
    }
    loadAI();
}
