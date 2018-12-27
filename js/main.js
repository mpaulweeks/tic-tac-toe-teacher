
// app start
(function (){

  var humanBrain = {
    name: "Human",
    isRobot: false,
  };
  gameBoard = boardFactory(humanBrain);

  $('#pre-code').html('function determineRobotMove(board, api, square) {');
  $('#post-code').html('}');
  presetRobots.forEach(function (r){
    if (r.isVisible){
      var html = '<button id="load-' + r.id + '">Load ' + r.name + '</button><br/><br/>';
      $('#preset').append(html);
      $('#load-' + r.id).click(function(){
        checkLoadPreset(r);
      });
    }
  })

  var editorCode = ace.edit("editor-code");
  var editorDocs = ace.edit("editor-docs");
  [editorDocs].forEach(function (editor){
    editor.setReadOnly(true);
    editor.renderer.setShowGutter(false);
    // editor.renderer.setOption('showLineNumbers', false);
  });
  [editorCode, editorDocs].forEach(function (editor){
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setOptions({
      mode: "ace/mode/javascript",
      tabSize: 2,
      useSoftTabs: true,
    });
    editor.$blockScrolling = Infinity;
  });
  editorDocs.setValue(codeDocs, -1);

  function loadRobot(robot){
    if (robot.code != editorCode.getValue()){
      editorCode.setValue(robot.code, -1);
    }
    gameBoard.loadBrains(humanBrain, robot);
  }
  function checkLoadPreset(robot){
    var found = false;
    var currentCode = editorCode.getValue();
    presetRobots.forEach(function (r){
      if (r.isVisible){
        found = found || r.code == currentCode;
      }
    });
    var ok = true;
    if (!found){
      ok = confirm("This will discard your current code. Continue?");
    }
    if (ok){
      loadRobot(robot);
    }
  }

  $('#save-reload').click(function (){
    var code = editorCode.getValue();
    Tool.saveCode(code);
    var robot = createCustomRobot(code);
    loadRobot(robot);
  });
  $('#sim-thinking').hide();
  $('#run-simulator').click(function(){
    $('#sim-ready').hide();
    $('#sim-thinking').show();
    $('#sim-1-results').empty();
    $('#sim-2-results').empty();
    var count = presetRobots.length;
    var callback = function(){
      count -= 1;
      if (count <= 0){
        $('#sim-ready').show();
        $('#sim-thinking').hide();
      }
    };
    var code = editorCode.getValue();
    Tool.saveCode(code);
    var robot = createCustomRobot(code);
    presetRobots.forEach(function (pr){
      simulate(robot, pr, callback);
    });
  });
  $('#export-gist').click(function (){
    Tool.exportGist(editorCode.getValue())
  });

  // init
  var cookieCode = Tool.loadCode();
  if (cookieCode){
    var robot = createCustomRobot(cookieCode);
    loadRobot(robot);
  } else {
    loadRobot(simpleRobot);
  }
})()
