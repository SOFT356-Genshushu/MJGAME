
/**
 * Created by litengfei on 2017/1/8.
 */
var app = require("./../core/app.js").instance;
var Config = require('./../core/Config.js');
var UnitTools = require("./../core/UnitTools.js");
var safeCode = Config.getServerConfig()["safeCode"];
var Handler = require('./../app/tuidaohu/Handler.js');
var DataBaseManager = require("./../Theme/FangkaMajiang/db/DataBaseManager.js");
var User = require('./../app/tuidaohu/User.js');
var Codes = require("./../app/share/Codes.js");
DataBaseManager.instance().initDBFromServerConfig();
module.exports = function () {
    var onStart = function (serverID, serviceType, serverIP, serverPort, custom) {

    }

    var onClientIn = function (session) {

    }

    var onClientOut = function (session) {
    }

    var service = {};

    service.login = async function (account,pass,cb) {
        if(UnitTools.isNullOrUndefined(account) || UnitTools.isNullOrUndefined(pass)){
            cb({ok:false});
            return;
        }

        var infos = await DataBaseManager.instance().canLogin(account,pass,{headimgUrl:1,nickName:1,id:1});
        if(infos === null){
            cb({ok:true,suc:false});
            return;
        }
        User.setIsLogin(infos.id,true);
        User.setNickName(infos.id,infos.nickName);
        User.setHeadUrl(infos.id,infos.headimgUrl);
        User.setSession(infos.id,cb.session);

        var playerId = cb.session.playerId = infos.id;
        var table = User.getPlayerGameInstance(playerId);
        if(!table){
            cb({ok:true,suc:false,codes:Codes.Player_Not_In_Game});
            return;
        }
        var heads = table.getHeads();
        var frames = table.Logic.getRestoreFrames(playerId);
        console.log('heads:%o',heads);
        cb({ok:true,suc:true,info:infos,isInGame:true,inRoomInfo:{playerId:playerId,pos:User.getPos(playerId),heads:heads,roomId:table.tableId,frames:frames}});
    }

    service.createTable = function (playerId,tableId,roomInfo,serverCode,cb) {
        if(serverCode!==safeCode){
            cb({ok:false});
            return;
        }
        var oldTableId=User.getTableId(playerId);
        if(oldTableId){
            cb({ok:true,suc:false,tableId:oldTableId,info:"玩家已经在游戏中"});
            return;
        }

        Handler.createTable(playerId,tableId,roomInfo);
        Handler.inPos(playerId,tableId,0);
        cb({ok:true});
    }

    service.joinTable = async function (tableId,playerId,serverCode,cb) {
        if(serverCode!==safeCode){
            cb({ok:false});
            return;
        }
        var table = User.getPlayerGameInstance(playerId);
        if(!table){
            if(Handler.tables.hasKey(tableId)){
                if(!User.getHeadUrl(playerId)){
                    var baseInfo =  await DataBaseManager.instance().finPlayerWithId(playerId,{headimgUrl:1,nickName:1,id:1});
                    User.setNickName(baseInfo.id,baseInfo.nickName);
                    User.setHeadUrl(baseInfo.id,baseInfo.headimgUrl);
                }
                table = Handler.tables.getNotCreate(tableId);
                var freePos = table.room.getFreePos();
                if(freePos === null){
                    cb({ok:true,suc:false,codes:Codes.Game_Table_Full});
                    return;
                }else{
                    Handler.inPos(playerId,tableId,freePos);
                    User.setPlayerGameInstance(playerId,table);
                    cb({ok:true,suc:true});
                }
            }
        }else{
            cb({ok:true,suc:true});
        }
    }

    service.hitCard = function (data,cb) {
        //判断出牌的合法性
        var playerId = cb.session.playerId;
        if(!User.getIsLogin(playerId)){
            cb({ok:true,suc:false,Codes:Codes.Player_Not_Login});
            return;
        }

        var cardIndex = data.cardIndex;
        var actionId = data.actionId;
        var table = User.getPlayerGameInstance(playerId);
        if(!table){
            cb({ok:true,suc:false,codes:Codes.Player_Not_In_Game});
            return;
        }
        if(actionId!= table.actionId()){
            cb({ok:true,suc:false,codes:Codes.Game_Action_Not_Value});
            return;
        }
        var pos = User.getPos(playerId);
        if(pos!=table.hitPos()){
            cb({ok:true,suc:false,codes:Codes.Game_Action_Not_Value});
            return;
        }

        if(!table.hasCard(pos,cardIndex)){
            cb({ok:true,suc:false,codes:Codes.Game_Action_Not_Value});
            return;
        }
        
        //var table = User.getPlayerGameInstance(playerId);
        table.Logic.action.setRespond(pos,cardIndex);
        cb({ok:true,suc:true});
    }

    service.robHitCard = function (data,cb) {
        var playerId = cb.session.playerId;
        var table = User.getPlayerGameInstance(playerId);
        var pos = User.getPos(playerId);
        if(pos!=table.hitPos()){
            cb({ok:true,suc:false,codes:Codes.Game_Action_Not_Value});
            return;
        }
        var cardIndex = table.Logic.getRandomHitCard(pos);
        table.Logic.action.setRespond(pos,cardIndex);
        cb({ok:true,suc:true});
    }

    service.selectAction = function (data,cb) {
        var playerId = cb.session.playerId;
        if(!User.getIsLogin(playerId)){
            cb({ok:true,suc:false,Codes:Codes.Player_Not_Login});
            return;
        }
        var actionType = data.actionType
        var cardIndex = data.cardIndex;
        var actionId = data.actionId;
        var table = User.getPlayerGameInstance(playerId);
        if(!table){
            cb({ok:true,suc:false,codes:Codes.Player_Not_In_Game});
            return;
        }
        if(actionId!= table.actionId()){
            cb({ok:true,suc:false,codes:Codes.Game_Action_Not_Value});
            return;
        }

        var pos = User.getPos(playerId);

        if(!table.hasAction(pos,actionType)){
            cb({ok:true,suc:false,codes:Codes.Game_Action_Not_Value});
            return;
        }
        table.Logic.action.setRespond(pos,{actionType:actionType,cardIndex:cardIndex});
        cb({ok:true,suc:true});
    }

    service.ready = function (ready,cb) {
        var playerId = cb.session.playerId;
        if(!User.getIsLogin(playerId)){
            cb({ok:true,suc:false,Codes:Codes.Player_Not_Login});
            return;
        }
        var table = User.getPlayerGameInstance(playerId);
        if(!table){
            cb({ok:true,suc:false,codes:Codes.Player_Not_In_Game});
            return;
        }
        var pos = User.getPos(playerId);
        table.setReady(pos,ready);

    }

    service.isPlayerInGame = function (playerId,code,cb) {
        //code 1 表示正在游戏，2表示不在游戏
        if(safeCode!=code){
            cb({ok:true,suc:false});
            return;
        }
        var pos = User.getPos(playerId);
        if(UnitTools.isNullOrUndefined(pos)){
            cb({ok:true,suc:true,code:2});
            return;
        }
        cb({ok:true,suc:true,code:1});
    }

    return {
        service: service, onClientIn: onClientIn, onClientOut: onClientOut, onStart: onStart
    };
}
