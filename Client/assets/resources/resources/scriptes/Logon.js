// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

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
        logonBtn:cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            cc.director.loadScene("hall");
        },this);
       /*function openFileIIs(filename){        
        try{ 
            var obj=new ActiveXObject("wscript.shell"); 
            if(obj){ 
                obj.Run("\""+filename+"\"", 1, false );
                //obj.run("osk");/*打开屏幕键盘*/
                //obj.Run('"'+filename+'"'); 
               /* obj=null; 
            } 
        }catch(e){ 
            alert("请确定是否存在该盘符或文件"); 
        } 
        
    }*/
    },
    start () {

    },

    // update (dt) {},
});
