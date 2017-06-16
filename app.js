var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require("express-session");
var mongoose = require('mongoose');
var MongoStore = require("connect-mongo")(session);
var engine = require('./system');
var routes = require('./routes/index');
var flash = require('connect-flash');
var settings = require("./settings");
var ueditor = require("ueditor");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var index = require('./routes/index');
var users = require('./routes/users');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

app.use(session({
  secret:settings.coolieSecret,
  store:new MongoStore({
    db:settings.db
  }),
  resave:true,
  saveUninitialized:true
}));

//获取状态
app.use(function(req,res,next){
  res.locals.user = req.session.user;
  res.locals.post = req.session.post;
  var error = req.flash('error');
  res.locals.error = error.length?error:null;

  var success = req.flash('success');
  res.locals.success = success.length?success:null;

  next();
});


/*路由规划*/
app.get('/', index);
app.get('/users', users);
app.get('/login', index);
app.post('/login', index);
app.get('/article/:title', index);
app.post('/article/:title', index);
app.post('/register',index);
app.get('/register', index);
app.get('/registerW',index);
app.post('/registerW',index);
app.get('/about', index);
app.get('/backstageH', index);
app.post('/backstageH', index);
app.get('/backstageC', index);
app.post('/backstageC', index);
app.get('/backstageU', index);
app.post('/backstageU', index);
app.get('/backstageS', index);
app.post('/backstageS', index);
app.get('/logout',routes);
app.get('/post',routes);
app.post('/post',routes);
app.get('/feedback',routes);
app.post('/feedback',routes);
app.get('/forget',routes);
app.post('/forget',routes);
app.get('/forgetW',routes);
app.post('/forgetW',routes);
app.get('/modify',routes);
app.post('/modify',routes);


app.use("/ueditor/ueditor", ueditor(path.join(__dirname, 'public'), function(req, res, next) {
  // ueditor 客户发起上传图片请求
  if (req.query.action === 'uploadimage') {
    var foo = req.ueditor;
    var imgname = req.ueditor.filename;
    var img_url = '/images/ueditor/';
    //你只要输入要保存的地址 。保存操作交给ueditor来做
    res.ue_up(img_url);
  }
  //  客户端发起图片列表请求
  else if (req.query.action === 'listimage') {
    var dir_url = '/images/ueditor/';
    // 客户端会列出 dir_url 目录下的所有图片
    res.ue_list(dir_url);
  }
  // 客户端发起其它请求
  else {
    res.setHeader('Content-Type', 'application/json');
    res.redirect('/ueditor/nodejs/config.json');
  }
}));

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
