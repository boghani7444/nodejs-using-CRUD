/**
 * Created by vishal on 2/6/2017.
 */
var express = require('express');
var app = express();
var nodemailer = require('nodemailer');
var http = require('http');
var mysql = require('mysql');
var fs = require('fs');
var events = require('events');
var emitter = new events.EventEmitter();

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'featcsdev.chirag@gmail.com',
        pass: 'chirag@123'
    }
});

var path    = require("path");

var config = JSON.parse(fs.readFileSync('config.json'));

var host = config.host;
var port = config.port;

var connection = mysql.createConnection({
    host: 'localhost',
    user: config.user,
    password: config.password,
    database: config.database
});

connection.connect(function (error) {
    if(!!error){
        console.log('Error');
    }else{
        console.log('connected');
    }
});

app.use(express.static( __dirname + '/public'));

app.get('/user', function(request,responce){

    connection.query("SELECT * From users " , function (error,rows,fields) {
        if(!!error){
            console.log('Error in the query');
        }else{
            var html = "<a href='/user/add_user'>Add User</a>";
            html += "<table style='border: 1px solid;'><tr><th>Id</th><th>Name</th><th>Email</th><th>Mobile No</th><th colspan='2'>Action</th></tr>";
            for (var i=0;i < rows.length ; i++){
                var user = rows[i];
                html += "<tr><td>"+ user.id+"</td><td>"+ user.name+"</td><td>"+ user.email +"</td><td>"+ user.mobile +"</td>";
                html += "<td><a href='/user/"+user.id+"'>Edit</a>&nbsp;&nbsp;<a href='/delete_user/"+user.id+"'>Delete</a></td>";
                html += "</tr>";
            }
            html += "</table>";
            responce.send(html);
        }
    });
});


app.get('/user/add_user', function(request,responce){
    var html = "";
    html += "<form action='/add_user' name=''>";
    html += "<table style='border: 1px solid;'>";
    html += "<tr><th>Name : <input name='name' value='' id='name' ></th></tr>";
    html += "<tr><th>Email : <input name='email' value='' id='email' ></th></tr>";
    html += "<tr><th>Mobile No : <input name='mobile_no' value='' id='mobile' ></th></tr>";
    html += "<tr><th colspan='2'><input type='image' name='imageField' id='imageField' style='background-color: #3f3f3f;color: #FFF;padding: 10px;line-height: 50px;' class='send'></th></tr>";
    html += "</form>";
    html += "</table>";
    responce.send(html);
});

app.get('/user/:id', function(request,responce){
    connection.query("SELECT * From users where id = " + request.params.id ,function (error,rows,fields) {
        if(!!error){
            console.log('Error in the query');
        }else{
            var user = rows[0];
            if(user){
                var html = "";
                html += "<form action='/edit_user' name=''>";
                html += "<input type='hidden' name='id' value='"+ user.id+"' id='id' >";
                html += "<table style='border: 1px solid;'>";
                html += "<tr><th>Name : <input type='text' name='name' value='"+ user.name+"' id='name' ></th></tr>";
                html += "<tr><th>Email : <input type='text' name='email' value='"+ user.email+"' id='email' ></th></tr>";
                html += "<tr><th>Mobile No : <input type='text' name='mobile_no' value='"+ user.mobile+"' id='mobile' ></th></tr>";
                html += "<tr><th colspan='2'><input type='image' name='imageField' id='imageField' style='background-color: #3f3f3f;color: #FFF;padding: 10px;line-height: 50px;' class='send'></th></tr>";
                html += "</form>";
                html += "</table>";
                responce.send(html);
            }else{
                responce.send("Not User Found!!",404);
            }
        }
    });
});

app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/public/index.html'));
});

app.get('/add_user',function (req,res) {
    emitter.emit("addUser",req.query.name,req.query.email,req.query.mobile_no);
    res.redirect('/user');
});

app.get('/edit_user',function (req,res) {
    emitter.emit("editUser",req.query.id,req.query.name,req.query.email,req.query.mobile_no);
    res.redirect('/user');
});

app.get('/delete_user/:id',function (req,res) {
    emitter.emit("deleteUser",req.params.id);
    res.redirect('back');
});

emitter.on("addUser",function (name,email,mobile) {
    connection.query("INSERT INTO `users`(`name`, `mobile`, `email`) VALUES ( '" + name +"' ,'"+mobile +"','"+email+ "')",function (error,res) {
        if(!!error){
            console.log('Error in the query');
        }else{
            console.log('Insert Success');
        }
    });
});

emitter.on("editUser",function (id,name,email,mobile) {

    connection.query("UPDATE `users` SET `name` = '" + name +"' , `mobile`= '"+mobile +"' , `email` = '"+email+ "' where id = " + id ,function (error,res) {
        if(!!error){
            console.log('Error in the query');
        }else{
            console.log('Update Success');
        }
    });
});

emitter.on("deleteUser",function (id,name,email,mobile) {
    connection.query("DELETE FROM `users` WHERE id = " + id ,function (error,res) {
        if(!!error){
            console.log('Error in the query');
        }else{
            console.log('Delete Success');
        }
    });
});

http.createServer(app).listen(port,host);