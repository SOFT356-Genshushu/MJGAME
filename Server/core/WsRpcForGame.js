/**
 * Created by litengfei on 16/6/14.
 */
var WebSocketServerTool = require('ws').Server;
var UnitTools = require("./UnitTools.js");
var Events = require("events").EventEmitter;
var Session = require("./Session.js");
var MessagePack = require("msgpack-lite");
function WsRpcForGame()
{
    this.server = null;
    this.rpc = {};
    this.proxy = {};//clientProxy
    this.proxyDes = {};
    this.clientCb = {};
    this.readyCb = [];
    this.describe = null;
    this.eventss = new Events();
    this.cbTimeOut = 15000;
    this.sessions = {};
    this.port = null;
    this.ip = null;
    this.serverID = "";
    this.serverName = "";
}

WsRpcForGame.prototype.getRealIp = function (ip) {
    return ip.replace("::ffff:","");
}
//starServer
WsRpcForGame.prototype.start = function(port)
{
    var self = this;
    this.server = new WebSocketServerTool({port:port,perMessageDeflate: false,verifyClient:function(info){
        return true;
    }});
    this.server.on('connection', function (connection,req)
    {
        var session = connection.session = new Session(connection);
        session.serverID = self.serverID;
        session.serverName = self.serverName;
        //session.remoteAddress = self.getRealIp(req.connection.remoteAddress);
        session.rpcServer = this;
        self.addSession(session);

        self.sendDescribe(connection);//tell client describe
        self.handleClientIn(session);

        connection.on("close", function ()
        {
            self.handleClientClose(session);
            self.removeSession(connection.session.sessionID);

            connection.session.client = null;//防止循环引用，造成内存泄露
            connection.session = null;
            session = null;
        });
        connection.on("message", function (dataStr)
        {
            self.handleMessage(connection,dataStr);
        });
    });

    this.initDefaultRpc();//初始化默认的服务
    this.startClientCbTimeOut();
    this.startHeartBeatTimeOut();//添加客户端心跳超时
}

//系统内置的Rpc函数
WsRpcForGame.prototype.initDefaultRpc = function(){
    var self = this;
    //获取当前连接到服务端的客户端的代理信息
    this.rpc.getClientProxyInfo = function(sessionID,cb){
        var session = self.getSession(sessionID);
        if(UnitTools.isNullOrUndefined(session)){
            cb({proxydes:null});
            return;
        }
        var proxydes = session.getDescribeList();
        cb({proxydes:proxydes});
    }
    //执行客户端的函数
    this.rpc.doClientProxy = function(sessionID,actionName,args,cb){
        var session = self.getSession(sessionID);
        if(UnitTools.isNullOrUndefined(session)){
            cb();
            return;
        }
        session.proxy[actionName](args,cb);
    }
    this.rpc.heartBeat = function (cb) {
        cb({ok:true});
    }
}
WsRpcForGame.prototype.addRpc = function(rpcJson){
    var self = this;
    if(UnitTools.isJson(rpcJson)){
        UnitTools.forEach(rpcJson,function(funcName,func){
            self.rpc[funcName] = func;
        });
    }else{
        throw new Error("addRpc the arg must be a json");
    }
}

WsRpcForGame.prototype.close = function(){
    this.server.close();
}
//获得可以调用函数的列表
WsRpcForGame.prototype.getDescribeList = function()
{
    if(this.describe == null)this.describe = {};
    else
    {
        return this.describe;
    }
    var self = this;
    UnitTools.forEach(this.rpc,function(key,value)
    {
        self.describe[key] = {args:UnitTools.getFuncArgs(value).length-1};//length-1 not need the cb arg
    });
    return this.describe;
}

WsRpcForGame.prototype.getSession = function(sessionID){
    return this.sessions[sessionID];
}

WsRpcForGame.prototype.addSession = function(session)
{
    var sessionID = UnitTools.genID();
    this.sessions[sessionID] = session;
    session.sessionID = sessionID;
}
WsRpcForGame.prototype.removeSession = function(id)
{
    UnitTools.remove(this.sessions,id);
}

WsRpcForGame.prototype.checkRunActionArgNums = function(an,argNums)
{
    if(this.proxyDes[an].args != argNums)return false;
    return true;
}

WsRpcForGame.prototype.handleDescribe = function(client,data)
{
    client.session.handleDescribe(data);
}
//handle the client message
WsRpcForGame.prototype.handleMessage = function(client,message)
{
    var data = this.parseDataToJson(message);
    var type = data.type;
    switch (type)
    {
        case  1://describe
           this.handleDescribe(client,data);
            break;
        case  2://call function
            this.runActionWithRawMessage(client,data);
            break;
        case 3://callback
            this.handleCb(client,data);
            break;
    }
}

WsRpcForGame.prototype.handleCb = function(client,data)
{
    client.session.handleCb(data.data);
}
//handle the client close
WsRpcForGame.prototype.handleClientClose = function(session)
{
    try{
        session.closeCallTimeOut();
    }catch (e){

    }
    try{//防止出现错误，导致后面的代码没有执行
        //断开连接的Session，将回调函数统一返回为ok:false
        this.eventss.emit("clientClose",session);
    }catch(e){
    }

}

//hanle the client in
WsRpcForGame.prototype.handleClientIn = function(session)
{
    this.eventss.emit("clientIn",session);
}

//tell client the callbackData
WsRpcForGame.prototype.sendCallbackData = function(client,rawData,callbackID)
{
    var sendData = {};
    sendData.type = 3;
    sendData.data = {};
    sendData.data.cbData =  rawData;
    sendData.data.cbID = callbackID;
    this.sendRawData(client,sendData);
}

WsRpcForGame.prototype.sendActionData = function(client,rawData)
{
    var sendData = {};
    sendData.type = 2;
    sendData.data = rawData;
    this.sendRawData(client,sendData);
}

//tell client the describe
WsRpcForGame.prototype.sendDescribe = function(client)
{
    var names = this.getDescribeList();
    var sendData = {};
    sendData.type = 1;
    sendData.data = {des:names};
    this.sendRawData(client,sendData);
}

WsRpcForGame.prototype.runActionWithRawMessage = function(client,data)
{
    var an = data.data.an;
    var args = data.data.args;
    var callbackID = data.data.cbID;
    this.runAction(client,an,args,callbackID);
}
//run the function on server
WsRpcForGame.prototype.runAction = function(client,actionName,args,callbackID)
{
    var self = this;
    if(UnitTools.hasKey(this.rpc,actionName) == false)
    {
        throw new Error("client call function "+actionName+" is not defined");
    }
    var cb = function(cbData){
        //tell the client cb Data
        if(callbackID == 0)return;//cbID is 0 means no client no callback
        self.sendCallbackData(client,cbData,callbackID);
    };

    var cbInstance = cb.bind({});
    cbInstance.session = client.session;
    args.push(cbInstance);
    this.rpc[actionName].apply(this,args);
}

//run client action
WsRpcForGame.prototype.runClientAction = function(an,args,cb)
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
    sendData.args = Array.prototype.slice.call(arguments,1,length+!cbID);
    sendData.an = arguments[0];
    if(sendData.cbID != 0)
    {
        this.clientCb[sendData.cbID] = {cb:cb,time:UnitTools.now()};
    }
    this.sendActionData(this.client,sendData);
}


WsRpcForGame.prototype.getServerFuncArgNum = function(an)
{
    return this.proxyDes[an].args;
}

WsRpcForGame.prototype.parseDataToJson = function(str)
{
    return MessagePack.decode(str);
    //return JSON.parse(str);
}

WsRpcForGame.prototype.jsonDataToSend = function(data)
{
    //使用messagepack来序列化
    return MessagePack.encode(data)
}

WsRpcForGame.prototype.sendRawData = function(client,data)
{
    try{
        client.send(this.jsonDataToSend(data));
    }
    catch(e){
        console.log(e.stack)
    }
}

WsRpcForGame.prototype.onClientIn = function(callback)
{
    if(UnitTools.isFunction(callback) == false)return;
    this.eventss.on("clientIn",callback);
}

WsRpcForGame.prototype.onClientClose = function(callback)
{
    if(UnitTools.isFunction(callback) == false)return;
    this.eventss.on("clientClose",callback);
}

WsRpcForGame.prototype.startClientCbTimeOut = function()
{
    var self = this;
    setInterval(function()
    {
        UnitTools.forEach(self.sessions,function(key,value)
        {
            value.checkAndDeleteTimeOutCb(self.cbTimeOut);
        });
    },10000);
}

WsRpcForGame.prototype.startHeartBeatTimeOut = function () {
    var self = this;
    setInterval(function () {
        UnitTools.forEach(self.sessions,function(key,value)
        {
            try{
                value.client.send(value.jsonDataToSend({type:4}),function notRecive(err)
                {
                    //发生错误
                    if(err){
                        // console.log("进来了");
                        // console.log(value);
                        value.client._socket.destroy();
                    }
                });
            }catch (e){

            }

        });
    },10000);
}

module.exports = WsRpcForGame;