
var boardFactory = function () {
    var self = {};

    var blockPictures = [
        'img/block_x.png',
        'img/block_o.png'
    ];
    var playerId = 0;
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
            grid.push(-1);
        }
    };

    var makeMove = function (clickedBlock) {
        if (grid[clickedBlock] < 0) {
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
        var theyWon = false;
        winningBlocks.forEach(function (subarray) {
            theyWon = theyWon || containsSubArray(blocks, subarray);
        });
        return theyWon;
    };

    var switchPlayer = function () {
        $('#turn-'+playerId).hide();
        playerId = 1 - playerId;
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
    };

    var checkForWin = function () {
        var theyWon = didTheyJustWin();
        if (theyWon) {
            $('#turn-' + playerId).hide();
            $('#victory-' + playerId).show();
            getOwnedBlocks(playerId).forEach(function(bid){
                $('#block-'+bid).addClass('highlight');
            });
            gameOver = true;
        }
        else {
            switchPlayer();
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

    $('#reset').on('click', resetGame);
    $('.block').on('click', function () {
        if(gameOver){
            // do nothing
        }
        else{
            var blockId = $(this).data('id');
            var success = makeMove(blockId);
            if (success) {
                markBlock(blockId, playerId);
                checkForWin();
            }
        }
    });

    self.reset = resetGame;
    return self;
};

function ticTacToe(){
    boardFactory().reset();
}