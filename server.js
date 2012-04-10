var http = require('http');
var fs = require('fs');
var url = require('url');
var staticResource = require('static-resource');

var handler = staticResource.createHandler(fs.realpathSync('.'));

var server = http.createServer(function(req, res) {
		console.log(req.url);
    var path = url.parse(req.url).pathname;

    var isReqOk = handler.handle(path, req, res);
    if(!isReqOk) {
        res.writeHead(404);
        res.write('404');
        res.end();
    }
});
server.listen(8100);