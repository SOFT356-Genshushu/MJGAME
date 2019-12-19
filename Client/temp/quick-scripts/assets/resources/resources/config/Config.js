(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/resources/resources/config/Config.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '22272DzW3NMYJr5uVkptQlN', 'Config', __filename);
// resources/resources/config/Config.js

"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Config = function Config() {
  _classCallCheck(this, Config);
};

Config.testLoginUrl = "http://127.0.0.1:3000/testlogin";
Config.LogonUrl = "http://127.0.0.1:3000/Logon";
Config.UpdataScore = "http://127.0.0.1:3000/Updata";
module.exports = Config;

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
        //# sourceMappingURL=Config.js.map
        