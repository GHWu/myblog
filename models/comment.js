var mongodb = require("./db");

function Comment(username,title,comment,time){
	this.user = username;
	this.title = title;
	this.comment = comment;
	if(time){
		this.time = time;
	}
	else{
		this.time = new Date();
	}
}

module.exports = Comment;

Comment.prototype.save = function save(callback){
	//存入Mongodb的文档
	var comment = {
		username:this.user,
		title:this.title,
		comment:this.comment,
		time:this.time
	};

	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}

		//读取posts集合
		db.collection('comments',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//为user属性添加索引
			collection.ensureIndex('user',function(err){
				//写入post文档
				collection.insert(comment,{safe:true},function(err,comment){
					mongodb.close();
					callback(err,comment);
				});
			});

		});

	});
};

Comment.get = function get(title,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取posts集合
		db.collection('comments',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//查找user属性为username的文档，如果sername是null则全部匹配
			var query = {};
			if(title){
				query.title = title;
			}
			collection.find(query).sort({time:-1}).toArray(function(err,docs){
				mongodb.close();
				if(err){
					callback(err,null);
				}
				//封装posts为Post对象
				var comments = [];
				docs.forEach(function(doc,index){
					var year = doc.time.getFullYear();
					var month = doc.time.getMonth()+1;
					var day = doc.time.getDate();
					var pushtime = year + '-' + month +'-' + day;
					var comment = new Comment(doc.username,doc.title,doc.comment,pushtime);
					comments.push(comment);
				});
				callback(null,comments);
			});
		});
	});
};

Comment.getSix = function getSix(username,page,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取posts集合
		db.collection('comments',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//查找user属性为username的文档，如果sername是null则全部匹配
			var query = {};
			if(username){
				query.username = username;
			}
			collection.count(query,function(err,total){
				collection.find(query,{
					skip:(page-1)*6,
					limit:6
				}).sort({
					time: -1
				}).toArray(function (err, docs) {
					mongodb.close();
					if(err){
						callback(err,null);
					}
					//封装posts为Post对象
					var comments = [];
					docs.forEach(function(doc,index){
						var year = doc.time.getFullYear();
						var month = doc.time.getMonth()+1;
						var day = doc.time.getDate();
						var pushtime = year + '-' + month +'-' + day;
						var comment = new Comment(doc.username,doc.title,doc.comment,pushtime);
						comments.push(comment);
					});
					callback(null,comments,total);
				});
			});
		});
	});
};


