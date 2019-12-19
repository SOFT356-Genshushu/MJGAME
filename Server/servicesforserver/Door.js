/**
 * Created by litengfei on 2017/4/10.
 */

/**
 * Created by litengfei on 2017/1/8.
 * 门的主要作用是路由客户端的请求，一般用来做一些实时性不大的请求,比如登录，大厅操作等，比如游戏服务器的话，需要很强的顺序性的话，所以，需要再次联系游戏服务器
 */
var app = require("./../core/app.js").instance;
var UnitTools = require("./../core/UnitTools.js");

module.exports = function () {

    var onStart = function (serverID, serviceType, serverIP, serverPort, custom) {

    }

    var onClientIn = function (session) {

    }

    var onClientOut = async function (session) {
        var id = session.playerID;
        var info = await app.cache.get(id,"sessionID");
        app.debug("onClientOut %o",info);
        if(info){
            if(info.sessionID == session.sessionID){//设置为非登录状态
                app.cache.setWithCAS(id,{isLogin:false});
            }
        }
    }

    var service = {};
    const doors = app.appConfig["doors"];
    var codes = app.appConfig["codes"];
    //微信登录
    service.do = async function (funcName,argJson,cb) {
        let serviceName = doors[funcName];
        if(UnitTools.isNullOrUndefined(serviceName)){
            cb({ok:false,info:"服务器没有提供该方法"});
            return;
        }
        var service = app.getRandomService(serviceName);
        argJson.sessionID = cb.session.sessionID;
        var data = await service.runProxy[funcName](argJson);
        cb(data);
    }

    /**
     * 微信登录接口，调用LoginService的微信登录接口
     * @param argJson openid unionid access_token refresh_token
     * @param cb 返回 account pass
     * @return {Promise.<void>}
     */
    service.weixinLogin = async function (argJson,cb) {
        var service = app.getRandomService("LoginService");
        var info = await service.runProxy.weixinLogin(argJson);
        cb(info);
    }

    /**
     * 账号密码登录
     * @param argJson account pass
     * @return {Promise.<void>}
     */
    service.login = async function (argJson,cb) {
        var service = app.getRandomService("LoginService");
        var info = await service.runProxy.normalLogin(argJson);
        if(info.ok){//登录成功
            var ok = await app.cache.setWithCAS(info.info.id,{sessionID:cb.session.sessionID,isLogin:true}).catch(function (e) {
                ok = false;
                app.debug(" service.login 发生错误 %o",e);
            })
            if(ok){
                cb.session.playerID = info.info.id;
                cb({ok:true});
            }else {
                cb({ok:false,code:1000,info:codes[1000]});
            }
        }else cb(info);
    }

    return {
        service: service, onClientIn: onClientIn, onClientOut: onClientOut, onStart: onStart
    };
}