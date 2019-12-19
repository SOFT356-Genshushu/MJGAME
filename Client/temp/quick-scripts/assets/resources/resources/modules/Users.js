(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/resources/resources/modules/Users.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'e70d6IqABFBgrMD4Bx/bu4P', 'Users', __filename);
// resources/resources/modules/Users.js

"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by litengfei on 2018/1/28.
 */
var User = function User() {
    _classCallCheck(this, User);
};

User.playerId = null;
User.account = null; //账号
User.pass = null; //密码
User.nickName = ""; //名字
User.headUrl = ""; //头像地址
User.fangka = null; //房卡
User.sex = null; //性别
User.pos = null;
User.hallUrl = null;
User.loginToGameData = null; //登录到游戏服务器的数据
User.loginToHallData = null; //登录到大厅服务器的数据
User.Score = null;

User.isSelfPos = function (pos) {
    if (User.pos == pos) return true;
    return false;
};

User.isSelfPId = function (playerId) {
    if (User.playerId == playerId) return true;
    return false;
};
module.exports = User;

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
        //# sourceMappingURL=Users.js.map
        