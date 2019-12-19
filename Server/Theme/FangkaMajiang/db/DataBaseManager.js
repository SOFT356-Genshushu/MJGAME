const MongooseAsync = require('../../../core/MongooseAsync.js');
const UnitTools = require('./../../../core/UnitTools.js');
var Config = require('../../../core/Config.js');
class DataBaseManager{
    constructor(){
       this.inited = false;
    }
    static instance(){
        if(DataBaseManager.g_Instance==null){
            DataBaseManager.g_Instance = new DataBaseManager();
        }
        return DataBaseManager.g_Instance;
    }
    async initDB(account,pass,ip,port,dbname){
        if(this.inited == true)return;
        this.inited = true;
        this.mog = new MongooseAsync();
        var isOK = await this.mog.connect(account,pass,ip,port,dbname);
        if(isOK){
            this.mog.makeModel(
                "userinfo",
                {
                    id:Number,
                    account:String,
                    pass:String,
                    nickName:String,
                    headimgUrl:String,
                    loginTime:Date,
                    logonTime:Date,
                    score:Number
                }
            )
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }

    async initDBFromServerConfig(){
        var dbConfig = Config.getServerConfig()["database"]["mongodb"];
        return await this.initDB(dbConfig.account,dbConfig.pass,dbConfig.ip,dbConfig.port,dbConfig.dbname);
    }

    async createPlayer(id,account,pass,nickName,headimgUrl,score){
        var userinfoModule = this.mog.getModle("userinfo");
        var newPlayer = new userinfoModule();
        newPlayer.id=id;
        newPlayer.account=account;
        newPlayer.pass=pass;
        newPlayer.nickName=nickName;
        newPlayer.headimgUrl=headimgUrl;
        newPlayer.score=score;
        newPlayer.loginTime= new Date();
        newPlayer.logonTime= new Date();
        var info = await newPlayer.save().catch(function (e) {
            info = null;
        });
        return Promise.resolve(info);
    }

    async canLogin(account,pass,options = {id:1}){
        var userinfoModule = this.mog.getModle("userinfo");
        var infos = await userinfoModule.findOne({account:account,pass:pass},options).lean().catch(function (e) {
            infos =null;
        });
        return Promise.resolve(UnitTools.deepCopy(infos));
    }

    async findPlayerAccount(account,options){
        var userinfo = this.mog.getModle("userinfo");
        var infos = await userinfo.findOne({account},options).lean().catch(function (e) {
            infos = null;
        });
        return Promise.resolve(infos);
    }

    async findPlayer(account,pass,options){
        var userinfoModule = this.mog.getModle("userinfo");
        var infos = await userinfoModule.findOne({account:account,pass:pass},options).lean().catch(function (e) {
            infos =null;
        });
        return Promise.resolve(infos);
    }
    async finPlayerWithId(playerId,options){
        var userinfoModule = this.mog.getModle("userinfo");
        var infos = await userinfoModule.findOne({id:playerId},options).lean().catch(function (e) {
            infos =null;
        });
        return Promise.resolve(infos);
    }
    async UpdataScore(account,score){
        var userinfoModule = this.mog.getModle("userinfo");
        var Scores = await userinfoModule.findOne({account:account},{score:1}).lean().catch(function (e) {
            Scores =null;
        });
        Scores.score+=parseInt(score);
        console.log("score:"+score);
        console.log("SCORE.SCORE: ",Scores.score);
        console.log("SCORES：",Scores.score);
        var infos = await userinfoModule.updateOne({account:account},{$set:{score:Scores.score}}).lean().catch(function (e) {
            infos =null;
        });
        return Promise.resolve(infos);
    }
}

DataBaseManager.g_Instance = null;

module.exports = DataBaseManager;