var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');

var mongoose = require('mongoose');
mongoose.connect('mongodb://admin:admin@innosportlab-shard-00-00-0tqf6.mongodb.net:27017,innosportlab-shard-00-01-0tqf6.mongodb.net:27017,innosportlab-shard-00-02-0tqf6.mongodb.net:27017/InnoSportlab?ssl=true&replicaSet=InnoSportlab-shard-0&authSource=admin');
mongoose.Promise = require('q').Promise;

//models
require('./config/passport')(passport);
require('./models/user');
require('./models/coach');
require('./models/tag');
require('./models/video');

var index = require('./routes/index');
var users = require('./routes/users');
var coaches = require('./routes/coaches');
var tags = require('./routes/tags');
var videos = require('./routes/videos');
var auth = require('./routes/authentication');

function handleError(req, res, statusCode, message){
    console.log();
    console.log('-------- Error handled --------');
    console.log('Request Params: ' + JSON.stringify(req.params));
    console.log('Request Body: ' + JSON.stringify(req.body));
    console.log('Response sent: Statuscode ' + statusCode + ', Message "' + message + '"');
    console.log('-------- /Error handled --------');
    res.status(statusCode);
    res.json(message);
};

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

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

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'groepaisdeallerbeste',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', index);
app.use('/users', users(handleError));
app.use('/coaches', coaches(handleError));
app.use('/tags', tags(handleError));
app.use('/videos', videos(handleError));
app.use('/auth', auth(handleError, passport));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
