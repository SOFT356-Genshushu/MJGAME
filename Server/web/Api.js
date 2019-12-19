var ServerBlance = require('./ServerBlance.js');

var UnitTools = require("./../core/UnitTools.js");

var express = require('express');

var app = express();

var IDs = require("./../core/IDs.js");

var idGenerater = new IDs();
idGenerater.initFromConfig();

var DataBaseManager = require('./../Theme/FangkaMajiang/db/DataBaseManager.js');
app.all('*',function(req,res,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",'3.2.1');
    res.header("Content-Type",'text\/plain; charset=utf-8');
    next();
});
var asyncRun = async function () {

    var ok = await DataBaseManager.instance().initDBFromServerConfig();
    if(!ok){
        console.log("数据库初始化错误！！！请检查！@Api.js");
        return;
    }

    app.get("/getHallUrl/:id",function (req,res) {
        var id = req.param("id");
        if(UnitTools.isNullOrUndefined(id)){
            res.send('发生错误！！');
            return;
        }
        var ip = ServerBlance.getInstance().getIp("HallService",id);
        res.send(ip);
    });
    
    app.get("/testLogin/",async function (req,res) {
        var account = req.query.account;
        var pass = req.query.pass;
        if(!account)res.send();
        var playerAccount = await DataBaseManager.instance().findPlayerAccount(account,{account:1}); 
        console.log(playerAccount);
        if(playerAccount){
            var playerInfo = await DataBaseManager.instance().findPlayer(playerAccount.account,pass,{account:1,pass:1,nickName:1,id:1,headimgUrl:1});
            if(playerInfo){
                var hallUrl = ServerBlance.getInstance().getIp("HallService",account);
                res.send({code:10,ok:true,suc:true,id:playerInfo.id,hallUrl:hallUrl,account:playerInfo.account,pass:playerInfo.pass,nickName:playerInfo.nickName,headimgUrl:playerInfo.headimgUrl});
            }else{
                res.send({ok:true,suc:false})
            }
        }else{
            /*var id = await idGenerater.getId();
            var playerInfo = await DataBaseManager.instance().createPlayer(id,account,account,account,"https://raw.githubusercontent.com/SOFT356-Genshushu/Pic/master/1.png",0);
            var hallUrl = ServerBlance.getInstance().getIp("HallService",account);*/
            res.send({code:0,ok:false,suc:false});
        }
    });

    app.get("/Logon/",async function (req,res) {
        var account = req.query.account;
        var pass = req.query.pass;
        var head = req.query.head;
        if(!account)res.send();
        var playerAccount = await DataBaseManager.instance().findPlayerAccount(account,{account:1}); 
        console.log(playerAccount);
        if(!playerAccount){
            var id = await idGenerater.getId();
            var playerInfo = await DataBaseManager.instance().createPlayer(id,account,pass,account,head,0);
            if(playerInfo){
                res.send({ok:true,suc:true});
            }else{
                res.send({ok:true,suc:false})
            }
        }else{
            res.send({ok:false,suc:false});
        }
    });

    app.get("/Updata/",async function (req,res) {
        var account = req.query.account;
        var score = req.query.score;
        if(!account)res.send();
        var playerScore = await DataBaseManager.instance().UpdataScore(account,score); 
        if(playerScore){
            res.send({ok:true,suc:true});
        }else{
            res.send({ok:false,suc:false});
        }
    });
    
    app.listen(3000);
}

asyncRun();