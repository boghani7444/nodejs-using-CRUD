/**
 * Created by vishal on 2/6/2017.
 */

var http = require('http');
var fs = require('fs');

var config = JSON.parse(fs.readFileSync('config.json'));

var host = config.host;
var port = config.port;

var server = http.createServer(function (request,responce) {
    console.log('received request : ' + request.url);
    fs.readFile("./public"+request.url,function (error,data) {
        if(error){
            responce.writeHead('404',{"Content-type":"text/plain"});
            responce.end("Sorry The Page Not Found");
        }else{
            responce.writeHead('200',{"Content-type":"text/html"});
            responce.end(data);
        }
    });

});

server.listen(port,host,function () {
    console.log('listening ' + host + ':' + port);
});

fs.watchFile('config.json',function () {
    config = JSON.parse(fs.readFileSync('config.json'));
    host = config.host;
    port = config.port;
    server.close();
    server.listen(port,host,function () {
        console.log('Now Listening : ' + host+':'+ port);
    })
})