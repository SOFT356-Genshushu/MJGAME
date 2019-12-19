(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/resources/resources/common/UmengNative.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '531c5MvSLFCWqhkGIhhcK0+', 'UmengNative', __filename);
// resources/resources/common/UmengNative.js

"use strict";

/**
 * Created by litengfei on 16/12/5.
 */
var PlatForm = require("PlatForm");
function UmengNative() {}
UmengNative.onLoginSuceessCb = null;
UmengNative.onShareSuceessCb = null;

UmengNative.weixinLogin = function (cb) {
    //返回玩家信息
    UmengNative.onLoginSuceessCb = cb;
    //调用微信登录
    PlatForm.androidWithNoArgs("com/tongfei/umeng/UmengManager", "weixinLogin");
    PlatForm.iosNativeWithNoArgs("UmengManager", "weixinLogin:");
};

UmengNative.weixinShare = function (title, desc, imageUrl, webUrl, cb) {
    //微信朋友圈分享
    //微信朋友圈分享
    UmengNative.onShareSuceessCb = cb;
    PlatForm.androidNative("com/tongfei/umeng/UmengManager", "weixinShare", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", title, desc, imageUrl, webUrl);
    PlatForm.iosNative("UmengManager", "weixinShare:descr:imageUrl:webUrl:", title, desc, imageUrl, webUrl);
};

UmengNative.weixinFriendShare = function (title, desc, imageUrl, webUrl, cb) {
    //微信朋友圈分享
    UmengNative.onShareSuceessCb = cb;
    PlatForm.androidNative("com/tongfei/umeng/UmengManager", "weixinFriendShare", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", title, desc, imageUrl, webUrl);
    PlatForm.iosNative("UmengManager", "weixinFriendShare:descr:imageUrl:webUrl:", title, desc, imageUrl, webUrl);
};
//分享朋友本地图片
UmengNative.weixinFriendShareWithLocalImg = function (imageUrl, cb) {
    UmengNative.onShareSuceessCb = cb;
    PlatForm.androidNative("com/tongfei/umeng/UmengManager", "weixinFriendShareWithLocalImg", "(Ljava/lang/String;)V", imageUrl);
    PlatForm.iosNative("UmengManager", "weixinShareImage:", imageUrl);
};

UmengNative.weixinLoginSuccess = function (isOK, openid, unionid, access_token, refresh_token, expires_in, screen_name, city, prvinice, country, gender, profile_image_url) {
    var data = {};
    data.isOK = isOK;
    data["openid"] = openid;
    data["unionid"] = unionid;
    data["access_token"] = access_token;
    data["refresh_token"] = refresh_token;
    data["expires_in"] = expires_in;
    data["screen_name"] = screen_name;
    data["city"] = city;
    data["prvinice"] = prvinice;
    data["country"] = country;
    data["gender"] = gender;
    data["profile_image_url"] = profile_image_url;
    UmengNative.onLoginSuceessCb(data);
};

UmengNative.weixinShareSuccess = function (isOK) {
    //微信分享成功
    UmengNative.onShareSuceessCb(isOK);
};

UmengNative.isWeixinInstalled = function () {
    if (PlatForm.isAnroid()) {
        return true;
        //return PlatForm.androidNative("com/tongfei/umeng/UmengManager","isWeixinInstalled","(Ljava/lang/String;)Z","");
    }

    if (PlatForm.isIOS()) {
        return PlatForm.iosNativeWithNoArgs("UmengManager", "isWeixinInstalled:", "");
    }

    return false;
};
module.exports = UmengNative;

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=UmengNative.js.map
        