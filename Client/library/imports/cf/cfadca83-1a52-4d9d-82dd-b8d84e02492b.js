"use strict";
cc._RF.push(module, 'cfadcqDGlJNnYLduNhOAkkr', 'NetWorkManager');
// resources/resources/modules/NetWorkManager.js

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by litengfei on 2018/1/18.
 */
var AutoReconnectWsRpcClient = require("AutoReconnectWsRpcClient");
var Users = require("Users");
var EventEmitter = require("EventEmitter");
var Handler = require('Handler');

var NetWorkManager = function () {
    function NetWorkManager() {
        _classCallCheck(this, NetWorkManager);
    }

    _createClass(NetWorkManager, null, [{
        key: "connectAndAuthToHall",
        value: function connectAndAuthToHall(account, pass, url) {
            //cb 2params baseinfo service
            if (NetWorkManager.g_HallService === null) {
                NetWorkManager.g_HallService = new AutoReconnectWsRpcClient();
                NetWorkManager.g_HallService.connect(url);
                cc.log('login');
                NetWorkManager.g_HallService.onClose(function () {
                    //连接中断
                    NetWorkManager.g_HallServiceIsLogin = false;
                    NetWorkManager.events.emit("closeFromHall");
                    NetWorkManager.connectAndAuthToHall(account, pass, url);
                });
            }
            NetWorkManager.g_HallService.onReady(function (service) {
                service.proxy.login(account, pass, function (data) {
                    if (data.ok && data.suc) {
                        NetWorkManager.g_HallServiceIsLogin = true;
                        Users.account = account;
                        Users.pass = pass;
                        Users.nickName = data.info.nickname;
                        Users.headUrl = data.info.headimgurl;
                        Users.fangka = data.info.score;
                        Users.sex = data.info.sex;
                        Users.loginToHallData = data.info;
                        cc.log('info: ' + data.info);
                        NetWorkManager.events.emit("loginToHall", service);
                    }
                });
            });
        }
    }, {
        key: "onConnectedToHall",
        value: function onConnectedToHall(cb) {
            //cb 1param service
            if (NetWorkManager.g_HallServiceIsLogin) {
                cb(NetWorkManager.g_HallService);
                return;
            }
            NetWorkManager.events.on("loginToHall", cb);
            cc.log('ceshi');
        }
    }, {
        key: "offConnectedToHall",
        value: function offConnectedToHall(cb) {
            NetWorkManager.events.off(cb);
        }
    }, {
        key: "onClosedFromHall",
        value: function onClosedFromHall(cb) {
            //cb 1param service
            NetWorkManager.events.on("closeFromHall", cb);
        }
    }, {
        key: "offClosedFromHall",
        value: function offClosedFromHall(cb) {
            NetWorkManager.events.off(cb);
        }
    }, {
        key: "clearHallService",
        value: function clearHallService() {
            //清理当前大厅的连接
            NetWorkManager.events = new EventEmitter();
            NetWorkManager.g_HallServiceIsLogin = false;
            if (NetWorkManager.g_HallService) NetWorkManager.g_HallService.clear();
        }
    }, {
        key: "connectAndAuthToGame",
        value: function connectAndAuthToGame(account, pass, url) {
            //cb 2params baseinfo service
            if (NetWorkManager.g_GameService === null) {
                NetWorkManager.g_GameService = new AutoReconnectWsRpcClient();
                NetWorkManager.g_GameService.addRpc(Handler.service);
                NetWorkManager.g_GameService.connect(url);
                NetWorkManager.g_GameService.onClose(function () {
                    //连接中断
                    NetWorkManager.g_GameServiceIsLogin = false;
                    NetWorkManager.gameEvents.emit("closeFromGame");
                    NetWorkManager.connectAndAuthToGame(account, pass, url);
                });
            }
            NetWorkManager.g_GameService.onReady(function (service) {
                service.proxy.login(account, pass, function (data) {
                    if (data.ok && data.suc) {
                        cc.log('登陆游戏服务器成功：');
                        cc.log(data);
                        NetWorkManager.g_GameServiceIsLogin = true;
                        Users.account = account;
                        Users.pass = pass;
                        Users.nickName = data.info.nickname;
                        Users.headUrl = data.info.headimgurl;
                        Users.fangka = data.info.score;
                        Users.sex = data.info.sex;
                        Users.loginToGameData = data;
                        NetWorkManager.gameEvents.emit("loginToGame", service);
                    } else {
                        if (data.codes.code == 1000) {
                            NetWorkManager.connectAndAuthToHall(account, pass, Users.hallUrl);
                            NetWorkManager.onConnectedToHall(function () {
                                if (Users.loginToHallData.isInGame) {
                                    //跳转到游戏界面
                                    NetWorkManager.connectAndAuthToGame(Users.account, Users.pass, Users.loginToHallData.gameUrl);
                                    NetWorkManager.onConnectedToGame(function () {
                                        var loginData = Users.loginToGameData;
                                        if (loginData.isInGame) {
                                            cc.director.loadScene("game");
                                        } else {
                                            NetWorkManager.clearGameService();
                                        }
                                    });
                                } else {
                                    cc.director.loadScene("hall");
                                }
                            });
                        }
                    }
                });
            });
        }
    }, {
        key: "onConnectedToGame",
        value: function onConnectedToGame(cb) {
            //cb 1param service
            if (NetWorkManager.g_GameServiceIsLogin) {
                cb(NetWorkManager.g_GameService);
                return;
            }
            NetWorkManager.gameEvents.on("loginToGame", cb);
        }
    }, {
        key: "offConnectedToGame",
        value: function offConnectedToGame(cb) {
            NetWorkManager.gameEvents.off(cb);
        }
    }, {
        key: "onClosedFromGame",
        value: function onClosedFromGame(cb) {
            //cb 1param service
            NetWorkManager.gameEvents.on("closeFromGame", cb);
        }
    }, {
        key: "offClosedFromGame",
        value: function offClosedFromGame(cb) {
            NetWorkManager.gameEvents.off(cb);
        }
    }, {
        key: "clearGameService",
        value: function clearGameService() {
            //清理当前大厅的连接
            NetWorkManager.gameEvents = new EventEmitter();
            NetWorkManager.g_GameServiceIsLogin = false;
            if (NetWorkManager.g_GameService) {
                NetWorkManager.g_GameService.clear();
                NetWorkManager.g_GameService = null;
            }
        }
    }]);

    return NetWorkManager;
}();

NetWorkManager.g_HallService = null;
NetWorkManager.g_HallServiceIsLogin = false;
NetWorkManager.events = new EventEmitter();

NetWorkManager.g_GameService = null;
NetWorkManager.g_GameServiceIsLogin = false;
NetWorkManager.gameEvents = new EventEmitter();
module.exports = NetWorkManager;

cc._RF.pop();