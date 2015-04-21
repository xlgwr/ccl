var express = require('express');
var app = express();
var jwt = require('express-jwt');
var bodyParser=require('body-parser');//bodyparser+json+urlencoder
//var morgan=require('morgan');//logger
//var tokenManager=require('./config/token_manager');
//var secret=require('./config/secret');
var config=require('./config/config.js');

app.listen(3001);
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());

//app.use(morgan());

//Routes
var routes={};

routes.qadReportsUrls=require('./route/qadReportsUrls.js');
//routes.reports=require('./route/reports.js');


app.all('*',function(req,res,next){
   // res.set('Access-Control-Allow-Origin','http://localhost');
   // res.set('Access-Control-Allow-Origin','http://localhost:8000');
    console.log(config.acaoIp);
    res.set('Access-Control-Allow-Origin',config.acaoIp);
    //res.set('Access-Control-Allow-Credentials', true);
    //res.set('Access-Control-Allow-Methods', 'GET');//, POST, DELETE, PUT');
    //res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    if ('OPTIONS' == req.method) return res.send(200);
    next();
});

//get all qadreportsurls
//app.get('/','../../index.html');

//init qad from redis
app.get('/initRedis',routes.qadReportsUrls.initRedis);

//get qad report head
app.get('/qadReportsUrls',routes.qadReportsUrls.list);

//get the qad sub reports
app.get('/qadReportsUrls/:name',routes.qadReportsUrls.listAll);


console.log('CCL API is starting on port 3001');
