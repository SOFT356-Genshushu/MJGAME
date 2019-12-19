/**
 * Created by litengfei on 2017/9/14.
 * 微信相关操作，包括用户信息的获取，token的刷新等
 */
var UnitTools = require("./../core/UnitTools.js");
var AsyncRequest = require("./../model/AsyncRequest.js");
class Weixin {

    /**
     * 初始化微信配置 例如{"appid":"wxd58e9553e171da32","secret":"6ad2de08ce802ad3e2cb9083182adacb"}
     * @param config
     */
    static init(config) {
        Weixin.appid = config.appid;
        Weixin.secret = config.secret;
    }

    /**
     * 获得用户的信息,如果token失效，则自动刷新，刷新后，再次获取用户信息，如果refreshtoken失效的话,告知用户需要重新验证
     * @param accessToken
     * @param refeshToken
     * @return {code,info}  code 0 表示获取成功 code -1 表示获取失败 code 1 表示重新刷新了token 返回 access_token refresh_token openid  code2 表示需要客户端重新授权
     */
    static async getInfoOrRefresh(openid, accessToken, refeshToken) {
        //检测token是否过期了，如果过期了，就刷新token，然后继续获取，如果没过期，直接过去用户信息
        var tokenok = await Weixin.testToken(openid, accessToken);
        if (!tokenok) {
            var refresh = await Weixin.refreshToken(refeshToken);
            if (!refresh) {
                return new Promise(function (resolve,reject) {
                    resolve({code: 2});
                })
            }

            var info = await Weixin.getInfo(refresh.access_token,openid);
            if(info.code == -1)return new Promise(function (resolve,reject) {
                resolve(info);
            })
            
            return new Promise(function (resolve,reject) {
                info.access_token = refresh.access_token;
                info.refresh_token = refresh.refresh_token;
                resolve({code:1,info:info});
            })
        }

        var info = await Weixin.getInfo(accessToken, openid);
        return await new Promise(function (resolve) {
            if(info){
                info.access_token = accessToken;
                info.refresh_token = refeshToken;
            }
            resolve({code:0,info:info});
        });
    }

    static async getInfo(accessToken, openid) {
        var url = UnitTools.formatStr(Weixin.infoUrl, accessToken, openid);
        var info = await AsyncRequest.request(url);
        return new Promise(function (resolve) {
            if (!info) {
                resolve({code: -1});
                return;
            }
            info.code = 0;
            resolve(info);
        })
    }

    static async testToken(openid, accessToken) {
        var url = UnitTools.formatStr(Weixin.tokenValiadUrl, accessToken, openid);
        var value = await AsyncRequest.request(url);
        if (!value) {
            return await new Promise(function (resolve) {
                resolve(false);
            })
        }
        return new Promise(function (resolve) {
            if (value.errcode === 0) {
                resolve(true);
            }
            resolve(false);
        })
    }

    static async refreshToken(refreshToken) {
        //刷新token
        var url = UnitTools.formatStr(Weixin.refreshTokenUrl, Weixin.appid, refreshToken);
        var value = await AsyncRequest.request(url);
        if (!value) {
            return await new Promise(function (resolve) {
                resolve(false);
            })
        }
        return await new Promise(function (resolve) {
            if (value.errcode) {
                resolve(false);
                return;
            }
            resolve(value);
        })
    }
}
//验证token是否有效
Weixin.tokenValiadUrl = "https://api.weixin.qq.com/sns/auth?access_token={0}&openid={1}";
//刷新token
Weixin.refreshTokenUrl = "https://api.weixin.qq.com/sns/oauth2/refresh_token?appid={0}&grant_type=refresh_token&refresh_token={1}";
//获取用户信息
Weixin.infoUrl = "https://api.weixin.qq.com/sns/userinfo?access_token={0}&openid={1}";

module.exports = Weixin;


// (async function () {
//    var ok = await Weixin.testToken("sdf","sdfsd");
//    console.log(ok);
// })()