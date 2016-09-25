
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

return self;
}();