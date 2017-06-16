var mongodb = require("./db");

function Delete(title){
	this.title = title;
}

module.exports = Delete;

Delete.Deletearticle = function Deletearticle(title,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}

		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			collection.remove({"title":title},function(err, result) {
				console.log(title);
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

Delete.Deletecomment = function Deletecomment(comment,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}

		db.collection('comments',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			collection.remove({"comment":comment},function(err, result) {
				console.log(comment);
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

Delete.Deleteuser = function Deleteuser(username,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}

		db.collection('users',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			collection.remove({"name":username},function(err, result) {
				console.log(username);
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