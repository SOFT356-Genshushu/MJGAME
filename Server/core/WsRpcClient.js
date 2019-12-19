/**
 * Created by litengfei on 16/6/14.
 */
/**
 * Created by litengfei on 16/6/14.
 *
 */
var WebSocket = require('ws');
var MessagePack = require("msgpack-lite");
function WsRpcClient() {
    var self = this;
    this.client = null;
    this.url = null;
    this.rpc = {};
    this.proxy = {};//clientProxy
    this.run = {};//使用 await 可以调用的函数
    this.runCb = {};

    this.proxyDes = null;
    this.serverCb = {};
    this.isReady = false;
    this.readyCb = [];
    this.describe = null;
    this.events = new EventEmitter();
    this.cbTimeOut = 15000;//default cb time out
    this.cbInterval = null;
    this.isReconnected = true;
    this.haveConnectd = false;//已经连接过了

    this.runProxy = new Proxy(this,{get:function (target, name) {
        if(self.run[name])return self.run[name];
        return self.runServerActionAsync.bind(self,name);
    }})
}
//starServer
WsRpcClient.prototype.connect = function (url) {
    var self = this;
    this.url = url;
    this.client = new WebSocket(this.url,{perMessageDeflate:false});
    this.client.onopen = function (evt) {
        self.sendDescribe(self.client);
        self.events.emit("onConnect", self);
    }
    this.client.onmessage = function (evt) {
        self.handleMessage(self.client, evt.data);
    }
    this.client.onclose = function (evt) {
        self.stopCbTimeOut();
        if (self.isReady == true) {
            self.events.emit("onClose", self);
        }
        setTimeout(function () {
            if (self.isReconnected == true) {
                self.connect(self.url);
            }
        }, 1000);
        self.clearSocket();
    }
    this.client.onerror = function (evt) {
        setTimeout(function () {
            if (self.isReconnected == true) {
                self.connect(self.url);
            }
        }, 1000);
        self.clearSocket();
    }
}


WsRpcClient.prototype.startConnectUntilConnected = function (url) {//开始连接直到连接成功，只有在第一次连接的时候生效
    var self = this;
    this.url = url;
    this.client = new WebSocket(this.url, {
        perMessageDeflate: false
    });
    this.client.onopen = function (evt) {
        self.sendDescribe(self.client);
        self.events.emit("onConnect", self);
    }
    this.client.onmessage = function (evt) {
        self.handleMessage(self.client, evt.data);
    }
    this.client.onclose = function (evt) {
        self.stopCbTimeOut();
        if (self.isReady == true) {//如果刚开始 连接
            self.events.emit("onClose", self);
        }
        setTimeout(function () {
            if (self.haveConnectd == false) {
                self.startConnectUntilConnected(self.url);
            }
        }, 1000);
        self.clearSocket();
    }
    this.client.onerror = function (evt) {
        setTimeout(function () {
            if (self.haveConnectd == false) {
                self.startConnectUntilConnected(self.url);
            }
        }, 1000);
        self.clearSocket();
    }
}

WsRpcClient.prototype.clearSocket = function () {
    if (!this.client)return;
    this.client.onopen = null;
    this.client.onmessage = null;
    this.client.onclose = null;
    this.client.onerror = null;
    this.client = null;
}

WsRpcClient.prototype.close = function () {
    this.client.close();
}
//获得可以调用函数的列表
WsRpcClient.prototype.getDescribeList = function () {
    if (this.describe == null) this.describe = {};
    else {
        return this.describe;
    }
    var self = this;
    UnitTools.forEach(this.rpc, function (key, value) {
        self.describe[key] = {args: value.length - 1};//length-1 not need the cb arg
    });
    return this.describe;
}
WsRpcClient.prototype.getServerFuncArgNum = function (an) {
    return this.proxyDes[an].args;
}

WsRpcClient.prototype.addRpc = function (rpcJson) {
    var self = this;
    if (UnitTools.isJson(rpcJson)) {
        UnitTools.forEach(rpcJson, function (funcName, func) {
            self.rpc[funcName] = func;
        });
    } else {
        throw new Error("addRpc the arg must be a json");
    }
}

WsRpcClient.prototype.handleDescribe = function (client, data) {
    var self = this;
    var des = data.des;
    this.proxyDes = des;
    UnitTools.forEach(des, function (key, value) {
        self.proxy[key] = self.runServerAction.bind(self, key);
        self.run[key] = self.runServerActionAsync.bind(self,key);
    });
    this.startCbTimeOut();
    this.isReady = true;
    this.haveConnectd = true;
    this.events.emit("onReady", this);
    this.events.removeEvent("onReady");
}
//handle the client message
WsRpcClient.prototype.handleMessage = function (client, message) {
    var data = this.parseDataToJson(message);
    var type = data.type;
    switch (type) {
        case  1://describe
            this.handleDescribe(client, data.data);
            break;
        case  2://call function
            this.runActionWithRawMessage(client, data.data);
            break;
        case 3://callback
            this.handleCb(client, data.data);
            break;
    }
}

WsRpcClient.prototype.handleCb = function (client, data) {
    var cbID = data.cbID;
    var cbData = data.cbData;
    if (UnitTools.hasKey(this.serverCb, cbID)) {
        try {
            this.serverCb[cbID].cb(cbData);
            UnitTools.remove(this.serverCb, cbID);//delete call back
        }
        catch (e) {
            console.log(e.stack);
            UnitTools.remove(this.serverCb, cbID);//delete call back
        }
    }
    if(UnitTools.hasKey(this.runCb,cbID)){
        try{
            this.runCb[cbID].resolve(cbData);
            UnitTools.remove(this.runCb,cbID);
        }catch (e){
            this.runCb[cbID].resolve({ok:false});
        }
    }
}
//handle the client close
WsRpcClient.prototype.handleClientClose = function (client) {

}

WsRpcClient.prototype.sendRawData = function (client, data) {
    client.send(this.jsonDataToSend(data));
}

WsRpcClient.prototype.sendActionData = function (client, rawData) {
    var sendData = {};
    sendData.type = 2;
    sendData.data = rawData;
    this.sendRawData(client, sendData);
}

//tell client the callbackData
WsRpcClient.prototype.sendCallbackData = function (client, rawData, callbackID) {
    var sendData = {};
    sendData.type = 3;
    sendData.data = {};
    sendData.data.cbData = rawData;
    sendData.data.cbID = callbackID;
    this.sendRawData(client, sendData);
}
//tell client the describe
WsRpcClient.prototype.sendDescribe = function (client) {
    var names = this.getDescribeList();
    var sendData = {};
    sendData.type = 1;
    sendData.data = {des: names};
    this.sendRawData(client, sendData);
}

WsRpcClient.prototype.runActionWithRawMessage = function (client, data) {
    var an = data.an;
    var args = data.args;
    var callbackID = data.cbID;
    this.runAction(client, an, args, callbackID);
}
//run the function on server
WsRpcClient.prototype.runAction = function (client, actionName, args, callbackID) {
    var self = this;
    if (UnitTools.hasKey(this.rpc, actionName) == false) {
        throw new Error("server call function " + actionName + " is not defined");
    }
    args.push(function (cbData) {
        //tell the client cb Data
        if (callbackID == 0)return;//cbID is 0 means no client no callback
        self.sendCallbackData(client, cbData, callbackID);
    });
    this.rpc[actionName].apply(this, args);
}

//run client action first arg is bind to actionName  last is to be callback
WsRpcClient.prototype.runServerAction = function (an) {
    var length = arguments.length;
    var cb = arguments[length - 1];
    var cbID = UnitTools.isFunction(cb) ? UnitTools.genID() : 0;
    if (cbID == 0 && !this.checkRunActionArgNums(an, length - 1)) {
        console.log("server func " + "no callback need " + this.getServerFuncArgNum(an) + " args");
        return
    }
    else if (cbID != 0 && !this.checkRunActionArgNums(an, length - 2)) {
        console.log("server func " + an + " need " + this.getServerFuncArgNum(an) + " args");
        return;
    }
    var sendData = {};
    var cb = arguments[length - 1];
    sendData.cbID = cbID;
    sendData.args = Array.prototype.slice.call(arguments, 1, length - 1 + !cbID);
    sendData.an = arguments[0];
    if (sendData.cbID != 0) {
        this.serverCb[sendData.cbID] = {cb: cb, time: UnitTools.now()};
    }
    this.sendActionData(this.client, sendData);
}

WsRpcClient.prototype.runServerActionAsync = async function (an) {
    var args = arguments;
    return new Promise(function (resolve,reject) {
        this.onReady(function () {
            if(!this.checkRunActionArgNums(an, args.length - 1)){
                console.log("server func " + an + " need " + this.getServerFuncArgNum(an) + " args");
                return;
            }
            var cbID = UnitTools.genID();
            var sendData = {};
            sendData.cbID = cbID;
            sendData.args = Array.prototype.slice.call(args, 1, args.length);
            sendData.an = args[0];
            this.runCb[sendData.cbID] = { time: UnitTools.now(),resolve:resolve,reject:reject};
            this.sendActionData(this.client, sendData);
        }.bind(this))
    }.bind(this))
}



WsRpcClient.prototype.parseDataToJson = function (str) {
    return MessagePack.decode(str);
    //return JSON.parse(str);
}

WsRpcClient.prototype.jsonDataToSend = function (data) {
    return MessagePack.encode(data);
    //return JSON.stringify(data);
}


WsRpcClient.prototype.checkRunActionArgNums = function (an, argNums) {
    if (this.proxyDes[an].args != argNums)return false;
    return true;
}


WsRpcClient.prototype.onReady = function (callback) {
    if (this.isReady == false || this.client.readyState != 1) {
        this.isReady = false;
        this.events.on("onReady", callback);
        return;
    }
    else {
        callback(this);
    }
}

WsRpcClient.prototype.off = function (callback) {
    this.events.remove(callback);
}

WsRpcClient.prototype.onConnect = function (callback) {
    this.events.on("onConnect", callback);
}

WsRpcClient.prototype.onClose = function (callback) {
    this.events.on("onClose", callback);
}

WsRpcClient.prototype.startCbTimeOut = function () {
    var self = this;
    this.cbInterval = setInterval(function () {
        var rmA = [];
        UnitTools.forEach(self.serverCb, function (key, value) {
            if (UnitTools.isTimeOut(value.time, self.cbTimeOut)) {
                rmA.push(key);
            }
        });
        UnitTools.forEach(rmA, function (key, value) {
            try {
                self.serverCb[value].cb({ok: false})
                //console.log("调用超时!");
            } catch (e) {

            }
            UnitTools.remove(self.serverCb, value);
        });
        
        //run超时
        var runmA = [];
        UnitTools.forEach(self.runCb,function (key,value) {
            if (UnitTools.isTimeOut(value.time, self.cbTimeOut)) {
                runmA.push(key);
            }
        })
        UnitTools.forEach(runmA,function (key,value) {
            try {
                self.runCb[value].resolve({ok:false});
                //console.log("调用超时!");
            } catch (e) {
            }
            UnitTools.remove(self.runCb, value);
        })
    }, this.cbTimeOut);
}

WsRpcClient.prototype.stopCbTimeOut = function () {
    UnitTools.forEach(this.serverCb, function (key, value) {
        try {
            value.cb({ok: false});
            //console.log("连接关闭了，但是还没调用!");
        } catch (e) {

        }
    });
    clearInterval(this.cbInterval);
}

function UnitTools() {

}
UnitTools.isNullOrUndefined = function (value) {
    if (typeof  value == "undefined")return true;
    if (value == null)return true;
    return false;
}
UnitTools.isUndefined = function (value) {
    if (typeof  value == "undefined")return true;
    return false;
}
UnitTools.isFunction = function (value) {
    if (typeof value != "function")return false;
    return true;
}
UnitTools.isJson = function (value) {
    if (typeof  value != "object")return false;
    return true;
}
UnitTools.isArray = function (value) {
    if (typeof  value != "array")return false;
    return true;
}

UnitTools.getJsonKeys = function (json) {
    try {
        if (UnitTools.isJson(json) == false) {
            throw new Error("getJsonKeys must be json");
        }
        var names = [];
        for (var key in json) {
            names.push(key);
        }
        return names;
    }
    catch (e) {
        return [];
    }
}

UnitTools.hasKey = function (ob, key) {
    if (UnitTools.isUndefined(ob[key]))return false;
    return true;
}

UnitTools.remove = function (ob, key) {
    delete ob[key];
}

UnitTools.forEach = function (data, itemCallback) {
    if (UnitTools.isFunction(itemCallback) == false) {
        throw  new Error("UnitTools.forEach itemCallback must be a function");
    }
    if (UnitTools.isArray(data) || UnitTools.isJson(data)) {
        for (var key in data) {
            itemCallback(key, data[key]);
        }
    }
}


UnitTools.now = function () {
    return new Date().getTime();
}

UnitTools.getFuncArgs = function (func) {
    if (UnitTools.isNullOrUndefined(func))return;
    var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];
    return args.split(",").map(function (arg) {
        return arg.replace(/\/\*.*\*\//, "").trim();
    }).filter(function (arg) {
        return arg;
    });
}

UnitTools.genID = function () {
    var id = "";
    for (var i = 0; i < 8; i++) {
        id += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return id.toLowerCase();
}

UnitTools.isTimeOut = function (from, timeOut) {
    var delta = Date.now() - from;
    if (delta >= timeOut)return true;
}

function EventEmitter() {
    this.events = {};
}
EventEmitter.prototype.on = function (eName, callback) {
    var cbs = UnitTools.hasKey(this.events, eName) ? this.events[eName] : this.events[eName] = [];
    cbs.push(callback);
}
EventEmitter.prototype.emit = function (eName) {
    var args = Array.prototype.slice.call(arguments, 1, arguments.length);
    UnitTools.forEach(this.events[eName], function (key, value) {
        value.apply(this, args);
        try {

        } catch (e) {
        }
    });
}

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
        UnitTools.removeArray(self.events[key], value);
    });
}
EventEmitter.prototype.removeEvent = function (eName) {
    UnitTools.remove(this.events, eName);
}

module.exports = WsRpcClient;