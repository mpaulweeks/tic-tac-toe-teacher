
var gameBoard = null;
var boardFactory = function (humanBrain) {
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
    var robotTimeout = 500;
    var emptyBlockPid = 2;
    var isSimulation = !Boolean(humanBrain);
    var grid = {};
    var currentPlayerId = null;  // either 0 or 1
    var playerBrains = null;  // list of len 2
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

    function switchPlayer() {
        currentPlayerId = getOpponentId();
    }

    function resetGame() {
        currentPlayerId = 0;
        if (!isSimulation){
            var reversed = parseInt($('#settings input[name=turn]:checked').val()) == 0;
            if (reversed){
                currentPlayerId = 1;
            }
        }
        gameOver = false;
        drawGame = false;
        inputDisabled = false;
        resetGrid();
        for(var bid = 0; bid < grid.length; bid++){
            markBlock(bid, emptyBlockPid);
            if (!isSimulation){
                $('#block-'+bid).removeClass('highlight');
            }
        }
        displayMessage();
        if (getCurrentPlayer().isRobot){
            endHumanTurn();
        }
    }

    function displayMessage(){
        if (!isSimulation){
            var playerName = getCurrentPlayer().name;
            var message = playerName + "'s turn";
            if (drawGame){
                message = "Draw Game";
            } else if (gameOver) {
                message = playerName + " wins!";
            }
            $('#message').html(message);
        }
    }

    function displayImage(elm, pid) {
        var url = blockPictures[pid];
        elm.html('<img src="' + url + '" />');
    }

    function markBlock(blockId, pid) {
        if (!isSimulation){
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
    }

    function makeDto(){
        var dto = {};
        dto.freeSquares = getOwnedBlocks(emptyBlockPid);
        dto.mySquares = getOwnedBlocks(currentPlayerId);
        dto.opponentSquares = getOwnedBlocks(getOpponentId());
        return dto;
    }

    function endHumanTurn(){
        setTimeout(function (){
            startRobotTurn();
            inputDisabled = false;
        }, robotTimeout);
    }

    function startRobotTurn(){
        var cp = getCurrentPlayer();
        if (cp.isRobot){
            takeTurn(cp.move(makeDto(), api));
        } else {
            throw "not a robot";
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

    function endTurn() {
        var blocks = getOwnedBlocks(currentPlayerId);
        var winningMove = api.checkForWin(blocks);
        if (winningMove) {
            if (!isSimulation){
                winningMove.forEach(function(bid){
                    $('#block-'+bid).addClass('highlight');
                });
            }
            gameOver = true;
        }
        else if (getOwnedBlocks(emptyBlockPid).length == 0){
            gameOver = true;
            drawGame = true;
        } else {
            switchPlayer();
        }
        displayMessage();
    }

    if (!isSimulation){
        $('#reset').on('click', resetGame);
        $('.block').on('click', function () {
            if(gameOver || inputDisabled){
                // do nothing, wait for manual reset
            }
            else{
                var blockId = $(this).data('id');
                takeTurn(blockId);
                if (!gameOver){
                    endHumanTurn();
                }
            }
        });
    }

    self.resetGame = resetGame;
    self.loadBrains = function(brain1, brain2){
        brain1 = brain1 || humanBrain;
        brain2 = brain2 || humanBrain;
        playerBrains = [brain1, brain2];
        resetGame();
    };
    self.startRobotTurn = startRobotTurn;
    self.result = function(){
        return {
            drawGame: drawGame,
            gameOver: gameOver,
            winner: getCurrentPlayer(),
        };
    }
    return self;
};
