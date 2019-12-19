(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/resources/resources/scriptes/Login.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'a94ab0YoB1Eno8UVv65B1En', 'Login', __filename);
// resources/resources/scriptes/Login.js

"use strict";

// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

var UmengNative = require("UmengNative");
var UnitTools = require("UnitTools");
var Config = require("Config");
var PlatForm = require("PlatForm");
var TestLogin = require("TestLogin");
var LoginManager = require("LoginManager");
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        //testLoginCom:TestLogin//测试登录UI
        accountBox: cc.EditBox,
        passwordBox: cc.EditBox
    },

    // LIFE-CYCLE CALLBACKS:

    onLoginButtonClick: function onLoginButtonClick() {
        var account = this.accountBox.string;
        var pass = this.passwordBox.string;
        if (account != '' && pass != '') {
            LoginManager.testLogin(this.accountBox.string, this.passwordBox.string);
        } else {
            alert('Please enter your account and password');
        }
    },
    onLoad: function onLoad() {
        //this.testLoginCom.node.active = true;
        /*this.testLoginCom.setLoginEvent(function (account,pass) {
            cc.log("登录按钮响应");
            cc.log(account);
            cc.log(pass);
            LoginManager.testLogin(account,pass);
        })*/
    },
    start: function start() {}
}

// update (dt) {},
);

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
        //# sourceMappingURL=Login.js.map
        