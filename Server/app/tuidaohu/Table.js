var Room = require('./../share/Room.js');
var Logic = require('./Logic.js')
var User = require('./User.js');
var UnitTools = require("./../../core/UnitTools.js"); 

class Table{
    constructor(playerId,tableId,custom){
        this.posCount = 4;
        this.createId=playerId;
        this.tableId=tableId;
        this.custom=custom;
        this.room = new Room(tableId,4,null);
        this.Logic = new Logic(this);
    }

    getHead(pos){
        var info = {};
        info.pos = pos;
        info.playerId = this.room.getInPosInfo()[pos].account;
        info.headimgUrl = User.getHeadUrl(info.playerId);
        info.nickName = User.getNickName(info.playerId);
        return info;
    }

    getHeads(){
        var info = {};
        var posInfo = this.room.getInPosInfo();
        UnitTools.forEach(posInfo,function (pos,pinfo) {
            var one = info[pos] = {};
            one.playerId = pinfo.account;
            one.headimgUrl = User.getHeadUrl(one.playerId);
            one.nickName = User.getNickName(one.playerId);
        });
        return info;
    }

    inPos(playerId,pos){
        var ok = this.room.inPos(playerId,pos);
        return ok;
    }

    setReady(pos,ready){
        this.room.posReady(pos,ready);
    }

    actionId(){
        return this.Logic.action.actionId;
    }

    hitPos(){
        return this.Logic.toHitPos;
    }

    hasCard(pos,cardIndex){
        return !UnitTools.isNullOrUndefined(this.Logic.rawHandCard[pos][cardIndex]);
    }

    updata(){
        this.Logic.updata();
    }

    eachPos(cb){//遍历每一个位置
        for(var pos=0;pos<this.posCount;pos++){
            cb(pos);
        }
    }

    //获取下家位置
    getNextPos(pos) {
        var nextPos = new Number(pos) + 1;
        nextPos = nextPos > this.posCount - 1 ? 0 : nextPos;
        return nextPos;
    }

    //获得之前的位置
    getPrePos(pos) {
        var prePos = new Number(pos) - 1;
        prePos = prePos < 0 ? this.posCount - 1 : prePos;
        return prePos;
    }

    //获得对家的位置
    getTeamPos(pos) {
        var teamPos = new Number(pos) + 2;
        teamPos = teamPos > this.posCount - 1 ? teamPos - this.posCount : teamPos;
        return teamPos;
    }


    getPidWithPos(pos){
        return this.room.getInPosInfo()[pos].account;
    }

    getNames(){
        var info = {};
        var posInfo = this.room.getInPosInfo();
        UnitTools.forEach(posInfo,function (pos,pinfo) {
            info[pos] = User.getNickName(pinfo.account);
        });
        return info;
    }

    hasAction(pos,actionType){
        if(actionType==0)return true;
        var action = this.Logic.action;
        var actions = action.getActionData();
        if(UnitTools.isNullOrUndefined(actions[pos]))return false;
        if(UnitTools.isNullOrUndefined(actions[pos][actionType]))return false;
        return true;
    }
}

module.exports = Table;