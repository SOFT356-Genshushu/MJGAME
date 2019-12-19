"use strict";
cc._RF.push(module, '4097ejwbixNNo8GJs+poxSj', 'TestLogin');
// resources/resources/prefabs/TestLogin.js

'use strict';

// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

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
        passwordBox: cc.EditBox
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    setLoginEvent: function setLoginEvent(cb) {
        this.loginEvent = cb;
    },
    onLoginButtonClick: function onLoginButtonClick() {
        console.log('account: ' + this.accountBox.string);
        console.log('password: ' + this.passwordBox.string);
        this.loginEvent(this.accountBox.string, this.passwordBox.string);
    },
    start: function start() {}
}

// update (dt) {},
);

cc._RF.pop();