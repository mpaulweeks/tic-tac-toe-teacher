
var Tool = function(){
var self = {};

var cookieKey = "t4-code";
self.saveCode = function(code){
    try {
        if (localStorage) {
            localStorage.setItem(cookieKey, code);
        } else {
            console.log("browser doesn't support localStorage")
        }
    }
    catch (err) {
        alert(err.Description);
    }
};

self.loadCode = function(){
    if (localStorage) {
        return localStorage.getItem(cookieKey);
    }
    else {
        console.log("browser doesn't support localStorage");
        return null;
    }
};

self.exportGist = function(code){
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
};

self.format = function(str) {
    var args = arguments;
    return str.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};

self.readUrlParam = function(paramName, coerceInt, asList){
    asList = asList || false;
    var vars = {};
    var q = document.URL.split('?')[1];
    if(q != undefined){
        q = q.split('&');
        for(var i = 0; i < q.length; i++){
            var param = q[i].split('=');
            var name = param[0];
            var value = param[1];
            vars[name] = vars[name] || [];
            vars[name].push(value);
        }
    }
    if (vars.hasOwnProperty(paramName)){
        var paramList = vars[paramName];
        if (coerceInt){
            for (var i = 0; i < paramList.length; i++){
                paramList[i] = parseInt(paramList[i]);
            }
        }
        if (paramList.length == 1 && !asList){
            return paramList[0];
        }
        return paramList;
    }
    return null;
};

return self;
}();
