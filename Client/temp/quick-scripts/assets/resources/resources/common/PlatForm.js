(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/resources/resources/common/PlatForm.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '1f480Yt6ixPG7pa8Tp2+kop', 'PlatForm', __filename);
// resources/resources/common/PlatForm.js

"use strict";

/**
 * Created by litengfei on 16/12/5.
 */
function PlatForm() {}

PlatForm.androidNative = function (packageName, funcName, argsDescribe) {
    if (cc.sys.OS_ANDROID == cc.sys.os) {
        var args = [];
        args.push(packageName);
        args.push(funcName);
        args.push(argsDescribe);
        args = args.concat(Array.prototype.slice.call(arguments, 3, arguments.length));
        return jsb.reflection.callStaticMethod.apply(jsb, args);
    }
};

PlatForm.androidWithNoArgs = function (packageName, funcName) {
    return PlatForm.androidNative(packageName, funcName, "(Ljava/lang/String;)V", "placeholder");
};

PlatForm.iosNative = function (className, funcName) {
    if (cc.sys.OS_IOS == cc.sys.os) {
        var args = [];
        args.push(className);
        args.push(funcName);
        args = args.concat(Array.prototype.slice.call(arguments, 2, arguments.length));
        return jsb.reflection.callStaticMethod.apply(jsb, args);
    }
};

PlatForm.iosNativeWithNoArgs = function (className, funcName) {
    return PlatForm.iosNative(className, funcName, "placeholder");
};

PlatForm.isAnroid = function () {
    if (cc.sys.OS_ANDROID == cc.sys.os) return true;
    return false;
};

PlatForm.isIOS = function () {
    if (cc.sys.OS_IOS == cc.sys.os) return true;
    return false;
};

module.exports = PlatForm;

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
        //# sourceMappingURL=PlatForm.js.map
        