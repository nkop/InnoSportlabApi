var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
require('dotenv').config();

var mongoose = require('mongoose');

let configDB = require('./config/database.js');

var connectionURL;

switch (process.env.APP_ENV) {
    case "local":
        connectionURL = configDB.local;
        break;
    case "test":
        connectionURL = configDB.test;
        break;
    default:
        connectionURL = configDB.remote;
}
console.log("Database: " + connectionURL);

mongoose.connect(connectionURL);
mongoose.Promise = require('q').Promise;


function handleError(req, res, statusCode, message) {
    console.log();
    console.log('-------- Error handled --------');
    console.log('Request Params: ' + JSON.stringify(req.params));
    console.log('Request Body: ' + JSON.stringify(req.body));
    console.log('Response sent: Statuscode ' + statusCode + ', Message "' + message + '"');
    console.log('-------- /Error handled --------');
    res.status(statusCode);
    res.json(message);
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//models
require('./models/tag');
require('./models/comment');
require('./models/user');
require('./models/video');
require('./models/message');

// routes
let index = require('./routes/index');
let users = require('./routes/users');
let messages = require('./routes/messages');
let tags = require('./routes/tags');
let comments = require('./routes/comments');
let videos = require('./routes/videos');


app.use('/', index);
app.use('/users', users(handleError));
app.use('/tags', tags(handleError));
app.use('/comments', comments(handleError));
app.use('/videos', videos(handleError));
app.use('/messages', messages(handleError));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
