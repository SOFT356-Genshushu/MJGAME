"use strict";
cc._RF.push(module, 'a10c1kJx3JJyJPluYRPaYs8', 'DisableEvent');
// resources/resources/scriptes/DisableEvent.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        bg: cc.Node
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.bg.on(cc.Node.EventType.TOUCH_START, function (event) {
            event.stopPropagation();
        }, this.node);
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

cc._RF.pop();