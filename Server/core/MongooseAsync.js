/**
 * Created by litengfei on 2017/9/11.
 */
var Mongoose = require("mongoose");
Mongoose.Promise = global.Promise;
String.prototype.format = function()
{
    var args = arguments;
    return this.replace(/\{(\d+)\}/g,
        function(m,i){
            return args[i];
        });
}

class MongooseAsync{
    constructor(){
         this.models = new Map();
    }
    async connect(account,pass,ip,port,dbName){
        return await new Promise(function (resolve,reject) {
            var self = this;
            this.connectUrl = "mongodb://{0}:{1}@{2}:{3}/{4}";

            this.connectUrl = this.connectUrl.format(account, pass, ip, port, dbName);
            console.log(this.connectUrl+"xxxxxx");
            this.db = Mongoose.connect(this.connectUrl,{ useMongoClient: true});
            this.db.on('connected', function () {
                resolve(true);
            });
            this.db.on('error', function (err) {
                resolve(false);
                self.connect(account, pass, ip, port, dbName);
            });

            this.db.on('close', function () {
                self.connect(account, pass, ip, dbName);
            });
        }.bind(this))
    }

    makeModel(name,modelJson){//创建model
        var schema =  new Mongoose.Schema(modelJson);
        var model = this.db.model(name,schema);
        this.models[name] = model;
        return model;
    }

    getModle(name){//获取model
        return this.models[name];
    }
}

module.exports = MongooseAsync;
