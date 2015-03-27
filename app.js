var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var acl = require('acl');

require('./server/models/models');  //initialize mongoose schemas
var index = require('./server/routes/index');
var authenticate = require('./server/routes/authenticate')(passport);
var blogs = require('./server/routes/blogs');
var mongoose = require('mongoose');                        

var dbc = mongoose.connect('mongodb://localhost/test'); 
//connect to Mongo

  mongoose.connection.on('connected', function() {
	  console.log("connecting to mongodb");
    acl = new acl(new acl.mongodbBackend(mongoose.connection.db));
	console.log("connected to mongodb");
  });
var app = express();

// view engine setup
app.set('views', path.join(__dirname, '/client/views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
/*app.use(session({
  secret: 'keyboard cat'
}));*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client')));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/auth', authenticate);
app.use('/blogs',blogs);

//allow cross origin request
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
//var auth = function(req, res, next){ if (!req.isAuthenticated()) res.send(401); else next(); };

//app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//// Initialize Passport
var initPassport = require('./server/passport-init');
initPassport(passport);

/*acl.allow([
    {
        roles:['user'], 
        allows:[
            {resources:'blogs', permissions:'get'}
        ]
    }
]);
*/

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	console.log("bb");
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

