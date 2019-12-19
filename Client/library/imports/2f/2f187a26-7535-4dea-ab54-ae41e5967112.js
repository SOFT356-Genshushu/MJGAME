"use strict";
cc._RF.push(module, '2f187omdTVN6qtUrkHllnES', 'logoninfo');
// resources/resources/scriptes/logoninfo.js

'use strict';

// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var CreatorHelper = require("CreatorHelper");
var UnitTools = require('UnitTools');
var Config = require('Config');
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
        accountBox: cc.EditBox,
        passwordBox: cc.EditBox,
        confirpasswordBox: cc.EditBox,
        headUrl: cc.EditBox,
        logonbtn: cc.Button,
        urlBtn: cc.Button,
        head: cc.Sprite
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, function (args) {
            if (this.accountBox.string != '' && this.passwordBox.string != '' && this.confirpasswordBox.string != '' && this.headUrl.string != '') {
                CreatorHelper.changeSpriteFrameWithServerUrl(this.head, this.headUrl.string);
                if (this.passwordBox.string === this.confirpasswordBox.string) {
                    UnitTools.request(Config.LogonUrl, { account: this.accountBox.string, pass: this.passwordBox.string, head: this.headUrl.string }, function (err, data) {
                        if (err) {
                            cc.log("Log On Error!!!");
                            cc.log(data);
                            return;
                        }
                        data = JSON.parse(data);
                        cc.log("Test registration results:");cc.log(data.ok);
                        if (data.ok == true && data.suc == true) {
                            cc.director.loadScene("login");
                        } else if (data.ok == true && data.suc == false) {
                            alert('Log On Faile');
                        } else if (data.ok == false && data.suc == false) {
                            alert('User name exists, please re-enter');
                            this.accountBox.string = '';
                        }
                    });
                } else {
                    alert('Confirm password error');
                    this.passwordBox.string = '';
                    this.confirpasswordBox.string = '';
                }
            } else {
                alert('Please Input Information');
            }
        }, this);
    },
    start: function start() {}
}

// update (dt) {},
);

cc._RF.pop();