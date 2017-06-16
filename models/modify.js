var mongodb = require("./db");

function Modify(username,newpassword){
	this.username = username;
	this.newpassword = newpassword;
}

module.exports = Modify;

Modify.modifypassword = function modifypassword(username,newpassword,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}

		db.collection('users',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.update({"name":username},{$set:{"password":newpassword}},function(err, result) {
				console.log(username);
				console.log(newpassword);
				if (err) {
					console.log('Error:' + err);
					mongodb.close();
					return;
				}
				mongodb.close();
				return callback();

			});
		});
	});
};

Modify.modifystateC = function modifystateC(username,newstateC,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}

		db.collection('users',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			collection.update({"name":username},{$set:{"stateC":newstateC}},function(err, result) {
				if (err) {
					console.log('Error:' + err);
					mongodb.close();
					return;
				}
				mongodb.close();
				return callback();

			});
		});
	});
};

Modify.modifyarticle = function modifysarticle(title,introduce,label,post,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}

		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			collection.update({"title":title},{$set:{"introduce":introduce,"label":label,"post":post}},function(err, result) {
				console.log(title);
				console.log(label);
				if (err) {
					console.log('Error:' + err);
					mongodb.close();
					return;
				}
				mongodb.close();
				return callback();

			});
		});
	});
};

Modify.modifylasttime = function modifylasttime(username,time,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}

		db.collection('users',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			collection.update({"name":username},{$set:{"lasttime":time}},function(err, result) {
				if (err) {
					console.log('Error:' + err);
					mongodb.close();
					return;
				}
				mongodb.close();
				return callback();

			});
		});
	});
};