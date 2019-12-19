(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/resources/resources/common/EventEmitter.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '663aaf68o5PKJX+Whxv58Jp', 'EventEmitter', __filename);
// resources/resources/common/EventEmitter.js

"use strict";

/**
 * Created by litengfei on 16/10/16.
 */
var UnitTools = require("UnitTools");
//var UnitTools = require("./UnitTools.js");
function EventEmitter() {
    this.events = {};
}
EventEmitter.prototype.on = function (eName, callback) {
    var cbs = null;
    if (UnitTools.hasKey(this.events, eName)) {
        cbs = this.events[eName];
    } else {
        cbs = this.events[eName] = [];
    }
    cbs.push(callback);
};
EventEmitter.prototype.emit = function (eName) {
    var args = Array.prototype.slice.call(arguments, 1, arguments.length);
    UnitTools.forEach(this.events[eName], function (key, value) {
        value.apply(value, args);
    });
};

EventEmitter.prototype.remove = function (callback) {

    var self = this;
    var rmA = {};
    for (var key in this.events) {
        var nameEvents = this.events[key];
        for (var key1 in nameEvents) {
            var oneCb = nameEvents[key1];
            if (oneCb == callback) {
                UnitTools.getOrCreateArrayInJson(key, rmA).push(oneCb);
            }
        }
    }
    UnitTools.forEach(rmA, function (key, value) {
        UnitTools.removeArray(self.events[key], [callback]);
    });
};

EventEmitter.prototype.off = function (callback) {
    this.remove(callback);
};
EventEmitter.prototype.removeEvent = function (eName) {
    UnitTools.remove(this.events, eName);
};

module.exports = EventEmitter;

// var test = function(){
//     var event = new EventEmitter();
//     var a = function () {
//
//     }.bind(this);
//
//     var b = function () {
//
//     }.bind(this);
//     event.on("a",a);
//     event.on("a",b);
//     console.log(event.events);
//
//     event.off(a);
//     event.off(b);
//     console.log(event.events);
// }
//
// test();

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
        //# sourceMappingURL=EventEmitter.js.map
        