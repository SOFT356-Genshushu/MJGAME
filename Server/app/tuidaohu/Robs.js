var Client = require('./../../core/WsRpcClient.js');
var HallIp = 'ws://127.0.0.1:39401';


var Robs = function (account,pass,afterlogin) {
    this.account = account;
    this.pass = pass;
    this.playerId = null;
    this.hallClient = new Client();
    this.hallClient.connect(HallIp);
    this.gameClient = null;
    this.login(afterlogin);
}

var proto  = Robs.prototype;

proto.login = function (afterlogin) {
    var self = this;
    this.hallClient.onReady(function (client) {
        client.proxy.login(self.account,self.pass,function (data) {
            console.log('机器人:%s, 登陆结果:%o',self.account,data);
            if(data.ok&&data.suc){
                self.playerId = data.id;
                if(afterlogin)afterlogin();
            }
        });
    });
}

proto.creatRoom = function (afterCreate) {
    var self = this;
    this.hallClient.onReady(function (client) {
        client.proxy.createRoom({qingyise:true,zimo:false,juNum:6},function (data) {
            console.log('机器人:%s, 创建房间结果:%o',self.account,data);
            if(data.ok&&data.suc){
                if(afterCreate)afterCreate(data.roomId);
                var gameUrl = data.url;
                self.connectToGameServerAndAuth(gameUrl);
            }
        });
    });
}

proto.joinRoom = function (roomId) {
    var self = this;
    this.hallClient.onReady(function (client) {
        client.proxy.joinTable(roomId,function (data) {
            console.log('机器人:%s, 加入房间结果:%o',self.account,data);
            if(data.ok&&data.suc){
                var gameUrl = data.gameUrl;
                self.connectToGameServerAndAuth(gameUrl);
            }
        });
    });
}

proto.connectToGameServerAndAuth = function (gameUrl) {
    var gameClient = this.gameClient = new Client();
    var service = {};
    service.toHitCard = function (data,cb) {
        setTimeout(function () {
            gameClient.proxy.robHitCard({},function () {

            });
        },2000);
    }
    service.hu = function (data,cb) {
        gameClient.proxy.ready(true,function () {});
    }
    var self = this;
    this.gameClient.addRpc(service);
    this.gameClient.connect(gameUrl);
    this.gameClient.onReady(function (client) {
        client.proxy.login(self.account,self.pass,function (data) {
            console.log('机器人:%s, 登陆游戏服务器结果:%o',self.account,data);
            if(data.ok&&data.suc){
                var gameUrl = data.url;
                //if(afterlogin)afterlogin();
            }
        });
    });
}

var rob1 = new Robs(1,1,function () {
    rob1.creatRoom(function (roomId) {
        var rob2 = new Robs(2,2,function () {
            rob2.joinRoom(roomId);
        });
        var rob3 = new Robs(3,3,function () {
            rob3.joinRoom(roomId);
        });  
    });
});