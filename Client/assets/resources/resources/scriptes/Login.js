// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

var UmengNative = require("UmengNative")
var UnitTools = require("UnitTools");
var Config = require("Config");
var PlatForm = require("PlatForm")
var TestLogin = require("TestLogin");
var LoginManager = require("LoginManager")
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
        accountBox:cc.EditBox,
        passwordBox:cc.EditBox,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoginButtonClick(){
        var account = this.accountBox.string;
        var pass = this.passwordBox.string;
        if(account!='' && pass!=''){
            LoginManager.testLogin(this.accountBox.string,this.passwordBox.string);
        }else{
            alert('Please enter your account and password');
        }
    },
    onLoad () {
            //this.testLoginCom.node.active = true;
            /*this.testLoginCom.setLoginEvent(function (account,pass) {
                cc.log("登录按钮响应");
                cc.log(account);
                cc.log(pass);
                LoginManager.testLogin(account,pass);
            })*/
    },

    start () {

    },

    // update (dt) {},
});
