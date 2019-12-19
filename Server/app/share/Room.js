var UnitTools = require("./../../core/UnitTools.js");
var Maps = require('./../../core/Map.js');
var Room = function (id, posCount, custom) {
    this.roomID = id;
    this.posCount = posCount;
    this.accounts = new Maps();//房间里的账号，为了以后的观战模式做准备
    this.posInfo = new Maps();//座位信息
    this.posReadyInfo = {};//座位准备情况
    this.custom = custom;
    this.isStarted = false; //是否已经开始了
    this.createTime = new Date();//创建的时间
    this.createAccount = null;//创建者的账号
}

Room.prototype.isPosValid = function (pos) {
    try {//判断座位号是否合法
        var posNum = new Number(pos);
        if (posNum < this.posCount && posNum >= 0)return true;
    } catch (e) {
        return false;
    }
}


Room.prototype.getPos = function (account) {
    if (UnitTools.isNullOrUndefined(account))return null;
    var findPos = null;
    for (var pos in this.posInfo) {
        this.posInfo.forEach(function (pos, info) {
            if (UnitTools.isNullOrUndefined(info.account))return;
            if (info.account.toString() === account.toString()) {
                findPos = pos;
            }
        });
    }
    return findPos;
}

Room.prototype.isPosEmpty = function (pos) {
    if (!this.isPosValid(pos))return false;
    var posInfo = this.posInfo.getNotCreate(pos);
    if (UnitTools.isNullOrUndefined(posInfo))return true;
    if (UnitTools.isNullOrUndefined(posInfo.account))return true;
    return false;
}

Room.prototype.isRoomEmpty = function () {
    var allAccounts = this.getInRoomAllAccounts();
    for (var key in allAccounts) {
        var account = allAccounts[key];
        var pos = this.getPos(account);
        if (!this.isPosEmpty(pos))return false;
    }
    return true;
}


Room.prototype.inRoom = function (account) {//进入房间
    this.accounts.setKeyValue(account,{});
    return true;
}


Room.prototype.inPos = function (account, pos) {//进入座位
    //判断玩家是不是在座位上，如果在，则移除之前的位置，进入新位置
    if (!this.isPosValid(pos))return false;
    this.inRoom(account);//如果直接调用inPos，那么需要把账号进入房间
    if (!this.isPosEmpty(pos))return false;
    var self = this;
    this.posInfo.forEach(function (key, value) {
        try {
            if (value.account.toString() === account.toString()) {
                self.posInfo.setKeyValue(key, {});
            }
        } catch (e) {
        }
    });
    var posInfo = this.posInfo.getOrCreate(pos);
    posInfo.account = account;
    posInfo.isReady = false;
    return true;
}

Room.prototype.outRoom = function (account) {//离开房间
    this.accounts.remove(account);
    return this.outPos(account);
}

Room.prototype.outPos = function (account) {
    if (UnitTools.isNullOrUndefined(account))return false;
    var self = this;
    this.posInfo.forEach(function (key, value) {
        try {
            if (value.account.toString() === account.toString()) {
                self.posInfo.remove(key);
            }
        } catch (e) {
        }
    });
    return true;
}

//获得和自己不是一对的座位
Room.prototype.getOtherSidePos = function (pos) {
    var nextPos = new Number(pos)+1;
    nextPos = nextPos>3?0:nextPos;

    var prePos = new Number(pos) -1;
    prePos = prePos<0?3:prePos;

    return [nextPos,prePos].sort();
}

//获取一个空闲的座位 如果没有的话返回null
Room.prototype.getFreePos = function () {
    var freePos = null;
    for(var startPos = 0;startPos<this.posCount;startPos++){
        var posInfo = this.posInfo.getNotCreate(startPos);
        if(UnitTools.isNullOrUndefined(posInfo) || UnitTools.isNullOrUndefined(posInfo.account)){
            return startPos;
        }
    }
    return freePos;
}

Room.prototype.exchangePos = function (account) {
    //1.判断账号是否在位置里，如果不在，直接返回
    //2.判断对面是否已经满了，如果满了，直接返回
    //3.离开当前位置，进入对面的位置
    var pos = this.getPos(account);
    if(UnitTools.isNullOrUndefined(pos))return {ok:false};
    var otherSidePos = this.getOtherSidePos(pos);

    for(var key in otherSidePos){
        var otherPos = otherSidePos[key];
        if(this.inPos(account,otherPos)){
            return {ok:true,info:{exchangeAccount:account,oldPos:pos,newPos:otherPos}};
        }
    }
    return {ok:false};
}

Room.prototype.posReady = function (pos, isReady) {
    if (!this.isPosValid(pos))return false;
    var posInfo = this.posInfo.getNotCreate(pos);
    if (UnitTools.isNullOrUndefined(posInfo))return false;
    posInfo.isReady = isReady;
    return true;
}


Room.prototype.isAllPosReady = function () {//所有的位置是不是准备好了
    var readyCounts = 0;
    this.posInfo.forEach(function (pos, info) {
        if (info.isReady === true)readyCounts += 1;
    });
    if (readyCounts === this.posCount)return true;
    return false;
}

Room.prototype.isPosReady = function (pos) {
    var info = this.posInfo.getNotCreate(pos);
    if (info.isReady === true)return true;
    return false;
}

Room.prototype.setAllPosReady = function (ready) {//设置所有位置准备或非准备
    for(var pos = 0;pos<this.posCount;pos++){
        this.posReady(pos,ready);
    }
}

Room.prototype.getReadyInfo = function () {
    var readyInfo = {};
    this.posInfo.forEach(function (pos, info) {
        if (info.isReady === true) {
            readyInfo[pos] = true;
        }
    });
    return readyInfo;
}


Room.prototype.getInPosInfo = function () {
    var posInfo = {};
    this.posInfo.forEach(function (pos, info) {
        if(UnitTools.isNullOrUndefined(info.account))return;
        var one = posInfo[pos] = {};
        one.ready = this.isPosReady(pos);
        one.account = info.account;
    }.bind(this));
    return posInfo;
}

Room.prototype.getRoomInPosAccounts = function () {//获得坐下的accounts
    var accounts = [];
    this.posInfo.forEach(function (key, value) {
        if (UnitTools.isNullOrUndefined(value.account))return;
        accounts.push(value.account)
    });
    return accounts;
}

Room.prototype.getNotInPosAccounts = function () {//获得没有在座位上的玩家
    var inPosAccounts = [].concat(this.getRoomInPosAccounts());
    var allAccounts = [].concat(this.getInRoomAllAccounts());
    UnitTools.removeArray(allAccounts, inPosAccounts);
    return allAccounts;
}

Room.prototype.getInRoomAllAccounts = function () {
    return this.accounts.getKeys();
}

Room.prototype.logRoomInfo = function () {
    var roomInfo = {};
    roomInfo.roomID = this.roomID;
    roomInfo.accounts = [];
    this.accounts.forEach(function (key, value) {
        roomInfo.accounts.push(key);
    });
    roomInfo.posInfo = {};
    this.posInfo.forEach(function (key, value) {
        roomInfo.posInfo[key] = value;
    });
    roomInfo.posReadyInfo = this.posReadyInfo;
    console.log(roomInfo);
    return roomInfo;
}
module.exports = Room;

