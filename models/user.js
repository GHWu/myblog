var mongodb = require('./db');


function User(user){
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
	this.stateC = user.stateC;
	this.registertime = user.registertime;
	this.lasttime =user.lasttime;
}

module.exports = User;

User.prototype.save = function save(callback){
	//存入mongodb的文档
	var user = {
		name:this.name,
		password:this.password,
		email:this.email,
		stateC:this.stateC,
		registertime:this.registertime,
		lasttime:this.lasttime
	};
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}

		//读取users集合
		db.collection('users',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//为name属性添加索引，新版本的ensureIndex方法需要一个回调函数
			collection.ensureIndex('name',{unique:true},function(err){
				//写入user文档
				collection.insert(user,{safe:true},function(err,user){
					mongodb.close();
					callback(err,user);
				});
			});

		});
	});
};

User.get = function get(username,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取users集合
		db.collection('users',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			//查找name属性为username的文档
			collection.findOne({name:username},function(err,doc){
				mongodb.close();
				if(doc){
					//封装文档为User对象
					var user = new User(doc);
					callback(err,user);
				}
				else{
					callback(err,null);
				}
			});
		});
	});
};


User.gets = function gets(username,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取posts集合
		db.collection('users',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//查找user属性为username的文档，如果username是null则全部匹配
			collection.find({}).sort().toArray(function(err,docs){
				mongodb.close();
				if(err){
					callback(err,null);
				}
				//封装posts为Post对象
				var users = [];
				docs.forEach(function(doc,index){
					var user = new User({
						name:doc.name,
						password:doc.email,
						email:doc.email,
						stateC:doc.stateC,
						registertime:doc.registertime,
						lasttime:doc.lasttime
					});
					users.push(user);
				});
				callback(null,users);
			});
		});
	});
};
