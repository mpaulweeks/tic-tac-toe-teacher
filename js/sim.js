
function simulate(brain1, brain2){
    var overallStats = [];
    var callbackFactory = function(p1, p2, callback){
        var count = 100;
        var robotStats = {
            total: count,
            win: 0,
            lose: 0,
            draw: 0,
        };
        return function(robot, drawGame){
            if (drawGame){
                robotStats.draw += 1;
            } else if (robot == brain1) {
                robotStats.win += 1;
            } else {
                robotStats.lose += 1;
            }
            count -= 1;
            if (count > 0){
                gameBoard.resetGame();
            } else {
                overallStats.push(robotStats);
                callback();
            }
        }
    }
    var out = $('#sim-results');
    out.html("calculating...");
    var printResults = function(){
        out.html(
            "going 1st: " + JSON.stringify(overallStats[0]) +
            "<br/>going 2nd: " + JSON.stringify(overallStats[1])
        );
    }
    var secondRun = callbackFactory(brain2, brain1, printResults);
    var firstRun = callbackFactory(brain1, brain2, function(){
        gameBoard.loadBrains(brain2, brain1, 0, secondRun);
    });
    gameBoard.loadBrains(brain1, brain2, 0, firstRun);
}
