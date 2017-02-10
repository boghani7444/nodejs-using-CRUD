/**
 * Created by vishal on 2/6/2017.
 */

var fs = require('fs');
var http = require('http');
console.log("Start");

fs.readFile('sample.txt',function (erree,res) {
    console.log("Contant :: " + res);
});



