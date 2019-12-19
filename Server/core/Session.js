/**
 * Created by litengfei on 16/6/15.
 */
var eventss = require("events").EventEmitter;
var UnitTools = require("./UnitTools.js");
var MessagePack = require("msgpack-lite");
function Session(client)
{
    this.client = client;
    this.proxy = {};
    this.proxyDes = {};
    this.clientCb = {};
    this.ready = false;
    this.readyCb = [];
    this.cbTimeOut = 15000;//默认15秒就算超时了，然后通知回调函数{ok:false}
    this.eventss = new eventss();
    var self = this;
    this.eventss.on("onReady",function()
    {
        UnitTools.forEach(self.readyCb,function(key,value)
        {
            value();
        });
    });
}
Session.prototype.getServerFuncArgNum = function(an)
{
    return this.proxyDes[an].args;
}
Session.prototype.handleDescribe = function(data)
{
    var self = this;
    var des = data.data.des;
    this.proxyDes = des;
    UnitTools.forEach(des,function(key,value)
    {
        self.proxy[key] = self.runClientAction.bind(self,key);
    });
    this.eventss.emit("onReady");
}

//得到已经处理保存过的DescribList
Session.prototype.getDescribeList = function(){
    return this.proxyDes;
}
Session.prototype.handleCb = function(data)
{
    var cbID = data.cbID;
    var cbData = data.cbData;
    if(UnitTools.hasKey(this.clientCb,cbID))
    {
        try
        {
            this.clientCb[cbID].cb(cbData);
            UnitTools.remove(this.clientCb,cbID);
        }
        catch(e)
        {
            UnitTools.remove(this.clientCb,cbID);
        }
    }
}

Session.prototype.sendRawData = function(client,data)
{
    if(UnitTools.isNullOrUndefined(client))return;
    client.send(this.jsonDataToSend(data));
}


Session.prototype.sendActionData = function(client,rawData)
{
    var sendData = {};
    sendData.type = 2;
    sendData.data = rawData;
    this.sendRawData(client,sendData);
}

Session.prototype.runClientAction = function(an)
{
    var length = arguments.length;
    var cb = arguments[length -1];
    var cbID = UnitTools.isFunction(cb)?UnitTools.genID():0;
    if(cbID == 0 && !this.checkRunActionArgNums(an,length-1))
    {
        console.log("client func " +an+" no callback need "+this.getServerFuncArgNum(an)+" args");
        return
    }
    else if(cbID != 0 && !this.checkRunActionArgNums(an,length-2))
    {
        console.log("client func "+an+ " need " + this.getServerFuncArgNum(an)+" args");
        return;
    }
    var sendData = {};
    var cb = arguments[length -1];
    sendData.cbID = cbID;
    sendData.args = Array.prototype.slice.call(arguments,1,length-1+!cbID);
    sendData.an = arguments[0];
    if(sendData.cbID != 0)
    {
        this.clientCb[sendData.cbID] = {cb:cb,time:UnitTools.now()};
    }
    this.sendActionData(this.client,sendData);
}



Session.prototype.parseDataToJson = function(str)
{
    return MessagePack.decode(str);
    //return JSON.parse(str);
}

Session.prototype.jsonDataToSend = function(data)
{
    return MessagePack.encode(data);
    //return JSON.stringify(data);
}



Session.prototype.checkRunActionArgNums = function(an,argNums)
{
    if(this.proxyDes[an].args != argNums)return false;
    return true;
}


Session.prototype.onReady = function(callback)
{
    if(this.ready == true)
    {
        callback();
        return;
    }
    this.readyCb.push(callback);
}

Session.prototype.checkAndDeleteTimeOutCb = function(cbTimeOut)
{
    var rmA = [];
    var self = this;
    UnitTools.forEach(this.clientCb,function(key,value)
    {
        if(UnitTools.isTimeOut(value.time,cbTimeOut))
        {
            rmA.push(key);
        }
    });
    if(rmA.length == 0)return;
    UnitTools.forEach(rmA,function(key,value)
    {
        try{
            self.clientCb[value].cb({ok:false})
            //console.log("调用超时!")
        }catch(e){

        }
        UnitTools.remove(self.clientCb,value);
    });
}

//断开连接后，所有的调用就算超时了
Session.prototype.closeCallTimeOut = function () {
    //所有等待回调的函数，都通知为false，因为断开连接了
    UnitTools.forEach(this.clientCb,function (key,value) {
        try{
            value.cb({ok:false});
            //console.log("连接关闭了，但是还没调用!");
        }catch(e){

        }
    });
}
module.exports = Session;