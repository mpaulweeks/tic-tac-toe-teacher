
function simulate(brain1, brain2, callback){
  var simBoard = boardFactory();

  var simOneGame = function(){
    simBoard.resetGame();
    while (!simBoard.result().gameOver){
      simBoard.startRobotTurn();
    }
    return simBoard.result();
  };
  var simManyGames = function(count){
    var robotStats = {
      total: 0,
      win: 0,
      lose: 0,
      draw: 0,
    };
    while (robotStats.total < count){
      var result = simOneGame();
      if (result.drawGame){
        robotStats.draw += 1;
      } else if (result.winner == brain1) {
        robotStats.win += 1;
      } else {
        robotStats.lose += 1;
      }
      robotStats.total += 1;
    }
    return robotStats;
  };
  var printableStats = function(rawStats){
    var out = [];
    rawStats.forEach(function (rawStat){
      var stat = {
        win: Math.round(100.0 * rawStat.win / rawStat.total),
        lose: Math.round(100.0 * rawStat.lose / rawStat.total),
        draw: Math.round(100.0 * rawStat.draw / rawStat.total)
      };
      out.push(stat);
    });
    return out;
  }
  var printResults = function(rawStats){
      // 'Going 1st - Win: {1}% - Lose: {2}% - Draw: {3}%<br/>'
      // 'Going 2nd - Win: {4}% - Lose: {5}% - Draw: {6}%
    var pStats = printableStats(rawStats);
    out.html(`
      <td>${brain2.name}</td>
      <td>${pStats[0].win}%</td>
      <td>${pStats[0].lose}%</td>
      <td>${pStats[0].draw}%</td>
      <td>${pStats[1].win}%</td>
      <td>${pStats[1].lose}%</td>
      <td>${pStats[1].draw}%</td>
    `);
  };
  var combineStats = function(stats1, stats2){
    if (stats1){
      stats2.total += stats1.total;
      stats2.win += stats1.win;
      stats2.lose += stats1.lose;
      stats2.draw += stats1.draw;
    }
    return stats2;
  };

  var overallStats = [];
  var divId = "sim-" + brain2.id;
  $('#sim-results').append(`<tr id="${divId}"></tr>`);
  var out = $('#' + divId);
  out.html("calculating...");
  var runSim = true;
  $('#cancel-sim').click(function (){
    runSim = false;
  });
  var calcStats = function(count){
    simBoard.loadBrains(brain1, brain2);
    overallStats[0] = combineStats(overallStats[0], simManyGames(count));
    simBoard.loadBrains(brain2, brain1);
    overallStats[1] = combineStats(overallStats[1], simManyGames(count));
    printResults(overallStats);
    if (overallStats[0].total < 5000){
      setTimeout(function (){
        calcStats(count + 100);
      }, 0);
    } else {
      callback();
    }
  }
  setTimeout(function(){
    calcStats(100);
  }, 0);
}
