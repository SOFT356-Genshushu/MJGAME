/**
 * Created by litengfei on 2018/1/23.
 */
var app = require('../../core/app.js').instance;
var Table = require("./Table.js");
var Map = require("./../../core/Map.js");
var User = require("./User.js");
var UnitTools = require("./../../core/UnitTools.js");
var Message = require('./Message.js');
class Handler{
    constructor(){
        this.tables = new Map();
        this.intVal = setInterval(this.updata.bind(this),10);
    }
    createTable(playerId,tableId,custom){
        var table = new Table(playerId,tableId,custom);
        table.handler = this;
        table.Logic.handler = this;
        this.tables.setKeyValue(tableId,table);
    }
    inPos(playerId,tableId,pos){
        var self = this;
        var table = this.tables.getNotCreate(tableId);
        table.inPos(playerId,pos);

        User.setTableId(playerId,table);
        User.setPlayerGameInstance(playerId,table);
        User.setPos(playerId,pos);

        //向客户端发送

        var inPosPIds = table.room.getRoomInPosAccounts();
        var headInfo = table.getHead(pos);
        UnitTools.forEach(inPosPIds,function (idx,PId) {
            if(PId==playerId){
                return;
            }
            User.send(PId,Message.inPos,headInfo);
        });


    }

    updata(){
        this.tables.forEach(function (tabId,table) {
            table.updata();
        });
    }


    sendEvent(playerId,eventName,data){
        UnitTools.forEach(playerId,function (index,pId) {
            User.send(pId,eventName,data);
        });
    }

    async recoverTab(tabId){
        var tab = this.tables.getNotCreate(tabId);
        if(tab){
            var inPosPIds = tab.room.getRoomInPosAccounts();
            for(var idx in inPosPIds){
                var pid = inPosPIds[idx];
                User.deletePlayer(pid);
            }
            this.tables.remove(tabId);//回收内寸
        }
        let ok = await app.getServiceWithServerID("IdService1").runProxy.recoverTabId(tabId);
        console.log('房间号回收结果'+tabId+':');
        console.log(ok);
    }

}
Handler.g = new Handler();
module.exports = Handler.g;