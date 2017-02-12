//jshint esversion:6
const express = require('express');
const debug = require('debug')('wopr-and-hal:server');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const hbs = require('express-handlebars');
const router = require('./routes/htmlRoute');
const api = require('./routes/apiRoute');
var io;

const app = express();

// view engine setup
app.engine('hbs', hbs({ defaultLayout: 'main', partialsDir: [__dirname + '/views/partials'],
extname: 'hbs'}));
app.set('view engine', 'hbs');
app.set('port', process.env.PORT || 8080);

//assign same port to Socket.io from express
io = require('socket.io')(app.listen(app.get('port'), function () {
  console.log("connected on http://localhost:%s", app.get('port'));
}));

// uncomment after placing favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev')); //TODO change to combined when deployed
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

app.use('/', router);
app.use('/api', api);

//TODO move to new chat route
io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

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
  res.status(err.status || 500).render('error');
});