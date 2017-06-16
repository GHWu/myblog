var mongodb = require("./db");

function Post(username,title,introduce,post,label,time){
	this.user = username;
	this.title = title;
	this.post = post;
	this.introduce = introduce;
	this.label = label;
	if(time){
		this.time = time;
	}
	else{
		this.time = new Date();
	}
}

module.exports = Post;

Post.prototype.save = function save(callback){
	//存入Mongodb的文档
	var post = {
		username:this.user,
		title:this.title,
		introduce:this.introduce,
		post:this.post,
		time:this.time,
		label:this.label
	};

	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}

		//读取posts集合
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//为user属性添加索引
			collection.ensureIndex('user',function(err){
				//写入post文档
				collection.insert(post,{safe:true},function(err,post){
					mongodb.close();
					callback(err,post);
				});
			});

		});

	});
};

Post.get = function get(username,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取posts集合
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//查找user属性为username的文档，如果sername是null则全部匹配
			var query = {};
			if(username){
				query.username = username;
			}
			collection.find(query).sort({time:-1}).toArray(function(err,docs){
				mongodb.close();
				if(err){
					callback(err,null);
				}
				//封装posts为Post对象
				var posts = [];
				docs.forEach(function(doc,index){
					var post = new Post(doc.username,doc.title,doc.introduce,doc.post,doc.label,doc.time);
					posts.push(post);
				});
				callback(null,posts);
			});
		});
	});
};

Post.getSix = function(username,page,callback) {
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取 posts 集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
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
					if (err) {
						return callback(err);//失败！返回 err
					}
					//解析 markdown 为 html
					var posts = [];
					docs.forEach(function(doc,index){
						var post = new Post(doc.username,doc.title,doc.introduce,doc.post,doc.label,doc.time);
						posts.push(post);
					});
					callback(null,posts,total);
				});
			});
		});
	});
};
