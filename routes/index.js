var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var nodemailer = require("nodemailer");
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Findpost = require('../models/findpost.js');
var Comment = require('../models/comment.js');
var Modify = require('../models/modify.js');
var Delete = require('../models/delete.js');

router.get('/', function(req, res, next) {
	var page=req.query.p?parseInt(req.query.p):1;
	var number = '6';
	Post.getSix(null,page,function(err,posts,total){
		if(err){
			posts = [];
		}
		res.render('index',{
			title:'Home',
			posts:posts,
			page:page,
			isFirstPage: (page - 1) == 0,
			isLastPage: ((page - 1) * number + posts.length) == total
		});
	});
});

router.get('/register', function(req, res, next) {
	res.render('register', { title: 'Register' });
});

router.post("/register", function(req, res) {
	var checkemail =  /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
	if(req.body['username'] == ""){
		req.flash('error','Error: Username cannot be empty');
		return res.redirect('/register');
	}
	if(req.body['password'] == ""){
		req.flash('error','Error: Password cannot be empty');
		return res.redirect('/register');
	}
	if(req.body['apassword'] == ""){
		req.flash('error','Error: Password-repeat cannot be empty');
		return res.redirect('/register');
	}
	if(req.body['email'] == ""){
		req.flash('error','Error: Email cannot be empty');
		return res.redirect('/register');
	}
	if(req.body['apassword'] != req.body['password']){
		req.flash('error', 'Error: Two password input inconsistent');
		return res.redirect('/register');
	}
	if(!checkemail.test(req.body['email'])){
		req.flash('error','Error:Please check your email format');
		return res.redirect('/register');
	}
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	var code = crypto.randomBytes(8).toString('hex');
	var newUser = new User({
		name: req.body.username,
		password: password,
		email: req.body.email,
		stateC: code,
		registertime:new Date(),
		lasttime:null
	});
	User.get(newUser.name, function(err, user) {
		if (user) {
			err = 'Username already exists.';
		}
		if (err) {
			req.flash('error', err);
			return res.redirect('/register');
		}
		newUser.save(function(err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/register');
			}
			req.session.user = newUser;
			SendCode(req.body['email'],"your Verification Code: "+code);
			console.log(code);
			req.flash('success', 'Success: Please enter your Verification Code');
			res.redirect('/registerW');
		});
	});
});

router.get('/registerW', function(req, res, next) {
	res.render('registerW', { title: 'Register' });
});

router.post('/registerW', function(req, res, next) {
	if(req.body['code'] == req.session.user.stateC){
		Modify.modifystateC(req.session.user.name,'register successful');
		req.flash('success', 'Success: ' + req.session.user.name + ' register successfully');
		res.redirect('/');
	}
	else{
		req.flash('error', 'Error: Please enter the true Verification Code');
		res.redirect('/registerW');
	}
});

router.get('/login', function(req, res, next) {
	res.render('login', { title: 'Login' });
});

router.post('/login',function(req,res){
	if(req.body['username'] == ""){
		req.flash('error','Error: Username cannot be empty');
		return res.redirect('/login');
	}
	if(req.body['password']==""){
		req.flash('error','Error: Password cannot be empty');
		return res.redirect('/login');
	}
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	User.get(req.body.username,function(err,user){
		if(!user || user.stateC != "register successful"){
			req.flash('error','Error:user does not exist');
			return res.redirect('/login');
		}
		if(user.password!=password){
			req.flash('error','Error:Password error');
			return res.redirect('/login');
		}
		req.session.user = user;
		Modify.modifylasttime(req.session.user.name,new Date(),function(err,callback){
			if(err){
				req.flash('error', err);
				return res.redirect('/');
			}
			req.flash('success','Success: Welcome, ' + req.session.user.name );
			res.redirect('/');
		});
	});
});

router.get("/logout",function(req,res){
	req.session.user = null;
	req.flash('success','Success: Logout');
	res.redirect('/');
});

router.get('/article/:title', function(req, res, next) {
	Findpost.article(req.params.title,function(err,doc){
		if(!doc){
			req.flash('error','Error: No article found');
			return res.redirect('/');
		}
		Comment.get(req.params.title,function(err,comments){
			if(err){
				comments = [];
			}
			var year = doc.time.getFullYear();
			var month = doc.time.getMonth()+1;
			var day = doc.time.getDate();
			var pushtime = year + '-' + month +'-' + day;
			res.render('article',{
				title:req.params.title,
				label:doc.label,
				time:pushtime,
				post:doc.post,
				comments:comments
			});
		});
	});
});

router.post('/article/:title',function(req, res, next){
	if(req.body['comment']==""){
		req.flash('error','Error: Comment cannot be empty');
		return res.redirect('/article/'+req.body['title']);
	}
	if(req.body['username']==""){
		req.flash('error','Error: Please login');
		return res.redirect('/article/'+req.body['title']);
	}
	var newComment = new Comment(req.body.username,req.body.title,req.body.comment);
	newComment.save(function(err){
		if (err) {
			req.flash('error', 'Error: '+ err );
			return res.redirect('/register');
		}
		req.flash('success','Success: Comment was pushed');
		res.redirect('/article/'+req.body['title']);
	});
});

router.get('/about', function(req, res, next) {
	res.render('about', { title: 'About' });
});

router.get('/post', function(req, res, next) {
	res.render('post', { title: 'Post' });
});

router.post("/post",function(req,res){
	var currentUser = req.session.user;
	var post = new Post(currentUser.name,req.body.title,req.body.introduce,req.body.post,req.body.label);
	post.save(function(err){
		if(err){
			req.flash('error',err);
			return res.redirect('/post');
		}
		req.flash('success','Success: Article was pushed');
		res.redirect('/');
	});
});

router.get('/backstageH', function(req, res, next){
	var page=req.query.p?parseInt(req.query.p):1;
	var number = '6';
	Post.getSix(req.session.user.name,page,function(err,posts,total){
		if(err){
			posts = [];
		}
		res.render('backstageH',{
			title:'backstage',
			posts:posts,
			page:page,
			isFirstPage: (page - 1) == 0,
			isLastPage: ((page - 1) * number + posts.length) == total
		});
	});
});

router.post('/backstageH',function(req,res,next){
	Delete.Deletearticle(req.body['delete-title'],function(err,callback){
		if (err) {
			req.flash('error', err);
			return res.redirect('/backstageH');
		}
		req.flash('success','Success: Article was deleted');
		res.redirect('/backstageH');
	})
});

router.get('/backstageC', function(req, res, next){
	var username = req.session.user.name;
	var page=req.query.p?parseInt(req.query.p):1;
	var number = '6';
	if(req.session.user.name == 'admin'){
		username = null;
	}
	Comment.getSix(username,page,function(err,comments,total){
		if(err){
			comments = [];
		}
		res.render('backstageC',{
			title:'backstage',
			comments:comments,
			page:page,
			isFirstPage: (page - 1) == 0,
			isLastPage: ((page - 1) * number + comments.length) == total
		});
	});
});

router.post('/backstageC',function(req,res,next){
	Delete.Deletecomment(req.body['delete-comment'],function(err,callback){
		if (err) {
			req.flash('error', err);
			return res.redirect('/backstageC');
		}
		req.flash('success','Success: Comment was deleted');
		res.redirect('/backstageC');
	})
});

router.get('/backstageU', function(req, res, next){
	User.gets(null,function(err,users){
		if(err){
			users = [];
		}
		res.render('backstageU',{
			title:'backstage',
			users:users
		});
	});
});

router.post('/backstageU',function(req,res,next){
	Delete.Deleteuser(req.body['delete-user'],function(err,callback){
		if (err) {
			req.flash('error', err);
			return res.redirect('/backstageU');
		}
		req.flash('success','Success: User was deleted');
		res.redirect('/backstageU');
	})
});

router.get('/backstageS', function(req, res, next){
	res.render('backstageS', {title: 'backstage'});
});

router.post('/backstageS',function(req,res, nex){
	var md5 = crypto.createHash('md5');
	var username = req.session.user.name;
	var newpassword = md5.update(req.body['backstage-password']).digest('base64');
	if(req.body['backstage-password'] = ""){
		console.log('password empty');
		req.flash('error','Error: New password cannot be empty');
		return res.redirect('/backstageS');
	}
	Modify.modifypassword(username,newpassword,function(err,callback){
		if (err) {
			req.flash('error', err);
			return res.redirect('/backstageS');
		}
		req.flash('success','Success: Password was modify');
		res.redirect('/backstageS');
	})
});

router.get("/feedback",function(req,res){
	res.render('feedback', {title: 'Feedback'});
});

router.post('/feedback',function(req,res, nex){
	if(req.body.message == ""){
		req.flash('error','Error: Message cannot be empty');
		return res.redirect('/feedback');
	}
	SendCode("353874815@qq.com","name: "+req.body.name+"<br/>"+"email: "+req.body.email+"<br/>"+"phone: "+req.body.phone+"<br/>"+"message: "+req.body.message);
	req.flash('success','Success: Message was send');
	res.redirect('/feedback');

});

router.get("/forget",function(req,res){
	res.render('forget', {title: 'Forget'});
});

router.post('/forget',function(req,res, nex){
	User.get(req.body.username,function(err,user){
		if(req.body.username == ""){
			req.flash('error','Error: Username cannot be empty');
			return res.redirect('/forget');
		}
		if(err){
			user = [];
		}
		if(!user || user.stateC != null){
			req.flash('error','Error: User does not exist');
			return res.redirect('/forget');
		}
		if(user.email!=req.body.email){
			req.flash('error','Error: Email error');
			return res.redirect('/forget');
		}
		var code = crypto.randomBytes(8).toString('hex');
		var yUser = new User({
			name: req.body.username,
			password: null,
			email: req.body.email,
			stateC: code
		});
		req.session.user = yUser;
		SendCode(req.body.email,"Your Verification Code:"+code);
		req.flash('success','Success: Verification Code was send');
		res.redirect('/forgetW');
	});
});

router.get("/forgetW",function(req,res){
	res.render('forgetW', {title: 'Forget'});
});

router.post('/forgetW',function(req,res, nex){
	if(req.body.code == ""){
		req.flash('error','Error: Verification Code cannot be empty');
		return res.redirect('/forgetW');
	}
	if(req.body.password == ""){
		req.flash('error','Error: Password cannot be empty');
		return res.redirect('/forgetW');
	}
	if(req.body.apassword == ""){
		req.flash('error','Error: Repeat password cannot be empty');
		return res.redirect('/forgetW');
	}
	if(req.body.password != req.body.apassword){
		req.flash('error','Error: Two password input inconsistent');
		return res.redirect('/forgetW');
	}
	if(req.body.code != req.session.user.stateC){
		req.flash('error','Error: Verification Code error');
		return res.redirect('/forgetW');
	}
	var md5 = crypto.createHash('md5');
	var username = req.session.user.name;
	var newpassword = md5.update(req.body['password']).digest('base64');
	Modify.modifypassword(username,newpassword,function(err,callback){
		if (err) {
			req.flash('error', err);
			return res.redirect('/forgetW');
		}
		req.flash('success','Success: Password was modify');
		res.redirect('/');
	})
});

router.get("/modify",function(req,res){
	var title =req.query.title;
	Findpost.article(title,function(err,doc){
		if(!doc){
			req.flash('error','Error: No article found');
			return res.redirect('/');
		}
		res.render('modify',{
			title:title,
			label:doc.label,
			post:doc.post,
			introduce:doc.introduce
		});
	});
});

router.post('/modify',function(req,res, nex){
	var title =req.query.title;
	if(req.body.introduce == ""){
		req.flash('error','Error: Introduce cannot be empty');
		return res.redirect('/modify');
	}
	if(req.body.post == ""){
		req.flash('error','Error: Post cannot be empty');
		return res.redirect('/modify');
	}
	Modify.modifyarticle(title,req.body.introduce,req.body.label,req.body.post,function(err,callback){
		if (err) {
			req.flash('error', err);
			return res.redirect('/modify');
		}
		req.flash('success','Success: Article was modify');
		res.redirect('/');
	})
});


function SendCode(useremail,content){
	var smtpTransport = nodemailer.createTransport({
		host: "smtp.qq.com",
		secure: true,
		port: 465,
		auth: {
			user: "153096997@qq.com",
			pass: "iegbwbfxmsfncbab"
		}
	});

	var mailOptions = {
		from: "Gareth <153096997@qq.com>",
		to: useremail,
		subject: "Welcome",
		html: "<b>"+content+"</b> "
	};

	smtpTransport.sendMail(mailOptions, function(error, response){
		if(error){
			console.log(error);
		}else{
			console.log("Message sent: " + response.message);
		}
		smtpTransport.close();
	});
}

module.exports = router;
