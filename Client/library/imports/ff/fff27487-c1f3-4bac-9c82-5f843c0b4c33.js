"use strict";
cc._RF.push(module, 'fff27SHwfNLrJyCX4Q8C0wz', 'BackToHall');
// resources/resources/scriptes/BackToHall.js

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
var User = require('Users');
var LoginManager = require("LoginManager");
var Config = require('Config');
var UnitTools = require('UnitTools');
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
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, function (args) {
            //LoginManager.testLogin(User.account,User.pass);
            //cc.log("User info: "+User.account,User.pass)
            //cc.director.loadScene('hall');
            UnitTools.request(Config.UpdataScore, { account: User.account, score: User.score }, function (err, data) {
                if (err) {
                    alert('NetWork ERROR!!!');
                    cc.log('ERROR %o', err);
                    cc.log('DATA %o', data);
                    return;
                }
                data = JSON.parse(data);
                cc.log('DATA %o', data.ok);
                if (data.ok == true && data.suc == true) {
                    cc.log('进入之前');
                    LoginManager.testLogin(User.account, User.pass);
                    cc.log('进入之后');
                }
            }, 5000);
        }, this);
    },
    start: function start() {}
}

// update (dt) {},
);

cc._RF.pop();