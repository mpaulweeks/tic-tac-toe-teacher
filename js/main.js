
function ticTacToe(){

    var cookieKey = "t4-code";
    function saveCodeBrowser(code){
        try {
            if (localStorage) {
                localStorage.setItem(cookieKey, code);
            } else {
                Cookie.createCookie(cookieKey, code, 7);
            }
        }
        catch (err) {
            alert(err.Description);
        }
    }

    function loadCodeBrowser(){
        if (localStorage) {
            return localStorage.getItem(cookieKey);
        }
        return Cookie.readCookie(cookieKey);
    }

    function exportGist(code){
        var data = {
            "description": "posting gist test",
            "public": false,
            "files": {
                "test.txt": {
                    "content": code,
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
        editor.getSession().setMode("ace/mode/javascript");
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
        saveCodeBrowser(code);
        var robot = robotFactory(code);
        loadRobot(robot);
    });
    $('#sim-thinking').hide();
    $('#run-simulator').click(function(){
        $('#sim-ready').hide();
        $('#sim-thinking').show();
        $('#sim-results').empty();
        var count = presetRobots.length;
        var callback = function(){
            count -= 1;
            if (count <= 0){
                $('#sim-ready').show();
                $('#sim-thinking').hide();
            }
        };
        var code = editorCode.getValue();
        saveCodeBrowser(code);
        var robot = robotFactory(code);
        presetRobots.forEach(function (pr){
            simulate(robot, pr, callback);
        });
    });
    $('#export-gist').click(function (){
        exportGist(editorCode.getValue())
    });

    // init
    var cookieCode = loadCodeBrowser();
    if (cookieCode){
        var robot = robotFactory(cookieCode);
        loadRobot(robot);
    } else {
        loadRobot(simpleRobot);
    }
}
