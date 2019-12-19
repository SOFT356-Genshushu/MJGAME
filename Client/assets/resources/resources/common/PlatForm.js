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

PlatForm.isAnroid = function(){
    if (cc.sys.OS_ANDROID == cc.sys.os)return true;
    return false;
}

PlatForm.isIOS = function(){
    if (cc.sys.OS_IOS == cc.sys.os) return true;
    return false;
}



module.exports = PlatForm;