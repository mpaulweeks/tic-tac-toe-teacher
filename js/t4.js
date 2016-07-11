
var boardFactory = function () {
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
    var robotBrain = null;

    function resetGrid() {
        grid = [];
        for (var i = 0; i < 9; i++) {
            grid.push(emptyBlockPid);
        }
    }

    function makeMove(clickedBlock) {
        if (grid[clickedBlock] == emptyBlockPid) {
            grid[clickedBlock] = playerId;
            return true;
        }
        return false;
    }

    function getOwnedBlocks(pid) {
        var ownedBlocks = [];
        for (var i = 0; i < grid.length; i++) {
            if (grid[i] == pid) {
                ownedBlocks.push(i);
            }
        }
        return ownedBlocks;
    }

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

    function getWinningBlocks() {
        var blocks = getOwnedBlocks(playerId);
        blocks.sort();
        var winningMove = null;
        winningBlocks.forEach(function (subarray) {
            if(!winningMove && containsSubArray(blocks, subarray)){
                winningMove = subarray;
            }
        });
        return winningMove;
    }

    function getOpponentId() {
        return 1 - playerId;
    }

    // view stuff
    function switchPlayer() {
        $('#turn-'+playerId).hide();
        playerId = getOpponentId();
        $('#turn-'+playerId).show();
        startTurn();
    }

    function resetGame() {
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
    }

    function checkForWin() {
        var winningMove = getWinningBlocks();
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
        }
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
        dto.mySquares = getOwnedBlocks(playerId);
        dto.opponentSquares = getOwnedBlocks(getOpponentId());
        return dto;
    }

    function startTurn(){
        if (playerId == robotBrain.id){
            // todo: disable click events, wait 1 second, re-enable events
            takeTurn(robotBrain.move(makeDto()));
        } else {
            // human turn: do nothing, wait for click event
        }
    }

    function takeTurn(blockId){
        var success = makeMove(blockId);
        if (success) {
            markBlock(blockId, playerId);
            checkForWin();
        }
    }

    $('#reset').on('click', resetGame);
    $('.block').on('click', function () {
        if(gameOver){
            // do nothing, wait for manual reset
        }
        else{
            var blockId = $(this).data('id');
            takeTurn(blockId);
        }
    });

    self.loadRobot = function(brain){
        robotBrain = brain;
        resetGame();
    };
    return self;
};

var robotFactory = function(robotFuncText){
    var self = {};

    var robotMover = new Function('board', 'api', 'square', robotFuncText);
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

    self.move = function(board){
        return robotMover(board, api, SQUARE);
    }
    self.id = Math.floor(Math.random() * 2);

    return self;
}

var sampleRobot = `
if (board.freeSquares.includes(square.Center)){
    return square.Center;
}
return api.getRandom(board.freeSquares);
`;

function ticTacToe(){
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");
    editor.setValue(sampleRobot);
    var game = boardFactory();

    function loadRobot(){
        var code = editor.getValue();
        var robot = robotFactory(code);
        game.loadRobot(robot);
    }
    $('#load').click(loadRobot);
    loadRobot();
}
