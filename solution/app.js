var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var adminRouter = require('./routes/admin');
var authRouter = require('./routes/auth');
var debugRouter = require('./routes/debug');
var indexRouter = require('./routes/index');
var postsRouter = require('./routes/posts');
var userRouter = require('./routes/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Serve stylesheets and Javascript for libraries in node_modules
app.use("/stylesheets", express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")))
app.use("/javascripts", express.static(path.join(__dirname, "node_modules/bootstrap/dist/js")))
app.use("/javascripts", express.static(path.join(__dirname, "node_modules/jquery/dist")))

app.use('/', indexRouter);
app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use('/', authRouter);
app.use('/', postsRouter);

//Only add debug routes if not in production
if (process.env.ENVIRONMENT === undefined || process.env.ENVIRONMENT !== "prod") {
  app.use('/debug', debugRouter);
}


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
