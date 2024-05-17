const createError = require('http-errors');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require("passport")

const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');
const debugRouter = require('./routes/debug');
const indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts');
const userRouter = require('./routes/user');
const apiRouter = require('./routes/api');

const {
  authenticationStrategy,
  serializeUser,
  deserializeUser, sessionErrorHandler, sessionSetup
} = require("./auth/passportAuth");
const { isAuthenticated, authInfo,isAdmin} = require("./middlewares/auth")

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* Session Auth Setup */
app.use(sessionSetup);
app.use(passport.authenticate('session'))
/* Session Error Handler */
app.use(sessionErrorHandler);

/* Passport setup */
passport.use(authenticationStrategy)
passport.serializeUser(serializeUser)
passport.deserializeUser(deserializeUser)

//Serve stylesheets and Javascript for libraries in node_modules
app.use("/stylesheets", express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")));
app.use("/javascripts", express.static(path.join(__dirname, "node_modules/bootstrap/dist/js")));

app.use("/javascripts", express.static(path.join(__dirname, "node_modules/jquery/dist")));
app.use("/javascripts", express.static(path.join(__dirname, "node_modules/socket.io/client-dist")));

app.use("/stylesheets", express.static(path.join(__dirname, "node_modules/leaflet/dist")));
app.use("/javascripts", express.static(path.join(__dirname, "node_modules/leaflet/dist")));

app.use("/stylesheets", express.static(path.join(__dirname, "node_modules/leaflet/dist")))
app.use("/javascripts", express.static(path.join(__dirname, "node_modules/leaflet/dist")))

app.use('/', authRouter);
app.use('/', authInfo, indexRouter);
app.use('/', isAuthenticated, userRouter);
app.use('/', isAuthenticated, postsRouter);
app.use('/admin', isAuthenticated, isAdmin, adminRouter);
app.use('/api', isAuthenticated, apiRouter)

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

  //Check if the error page exists in 'views/error' and render it, otherwise render the default error page
  //Check if file exists
  if (fs.existsSync(path.join(__dirname, 'views', 'error', `${err.status || 500}.ejs`)) === true) {
    res.render(`error/${err.status || 500}`, {isLoggedIn: req?.isLoggedIn || false, user: req?.user || false, message: err?.message});
  } else {
    res.render('error', {isLoggedIn: req?.isLoggedIn || false, user: req?.user || {}, message: err?.message});
  }
});

module.exports = app;
