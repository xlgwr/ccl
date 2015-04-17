var express = require('express');
var app = express();
var jwt = require('express-jwt');
var bodyParser=require('body-parser');//bodyparser+json+urlencoder
//var morgan=require('morgan');//logger
//var tokenManager=require('./config/token_manager');
//var secret=require('./config/secret');

app.listen(3001);
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());

//app.use(morgan());

//Routes
var routes={};

routes.qadreportsurls=require('./route/qadreportsurls.js');
//routes.reports=require('./route/reports.js');


app.all('*',function(req,res,next){
    res.set('Access-Control-Allow-Origin','http://localhost');
    res.set('Access-Control-Allow-Origin','http://localhost:8000');
    //res.set('Access-Control-Allow-Credentials', true);
    res.set('Access-Control-Allow-Methods', 'GET');//, POST, DELETE, PUT');
    //res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    if ('OPTIONS' == req.method) return res.send(200);
    next();
});

//get all qadreportsurls
app.get('/qadreportsurls',routes.qadreportsurls.list);

//get the qad sub reports
//app.get('/qadreporturls/:name',route.qadreporturls.listAll);

console.log('CCL API is starting on port 3001');
