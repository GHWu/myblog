var mongodb = require("./db");

function Findpost(title,post,time){
    this.title = title;
    this.post = post;
    this.time = time;
}

module.exports = Findpost;

Findpost.article = function article(title,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //∂¡»°postsºØ∫œ
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            collection.findOne({title:title},function(err,doc){
                mongodb.close();
                if(doc){
                    callback(err,doc);
                }
                else{
                    callback(err,null);
                }
            });
        });
    });
};

