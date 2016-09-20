
function ticTacToe(){
    var humanBrain = {
        name: "Human",
        isRobot: false,
    };

    gameBoard = boardFactory(humanBrain);

    $('#pre-code').html('function determineRobotMove(board, api, square) {');
    $('#post-code').html('}');

    var editorCode = ace.edit("editor-code");
    var editorDocs = ace.edit("editor-docs");
    [editorDocs].forEach(function (editor){
        editor.setReadOnly(true);
    });
    [editorCode, editorDocs].forEach(function (editor){
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/javascript");
        editor.$blockScrolling = Infinity;
    });
    editorDocs.setValue(codeDocs, -1);

    function loadRobot(robot){
        if (robot.code != editorCode.getValue()){
            editorCode.setValue(robot.code, -1);
        }
        if(parseInt($('#settings input[name=turn]:checked').val()) == 0){
            gameBoard.loadBrains(robot, humanBrain);
        } else {
            gameBoard.loadBrains(humanBrain, robot);
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

    $('#run-simulator').click(function(){
        var code = editorCode.getValue();
        var robot = robotFactory(code);
        simulate(robot, expertRobot);
    });

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
