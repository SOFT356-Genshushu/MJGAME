/**
 * Created by litengfei on 16/6/28.
 * 集群信息，以及服务信息，比如 服务器的IP地址，服务的种类等
 */
var Client = require("./WsRpcClient.js");
var Server = require("./WsRpcForGame.js");
var UnitTools = require("./UnitTools.js");
var path = require('path');
var EventEmitter = require("events").EventEmitter;
function Services(app) {
    this.app = app;
    this.services = {};//远程访问的客户端，使用ID作为关键字©
    this.servicesWithName = {};//客户端名字的map,一个名字对应一个数组
    this.servicesWithCustom = {};//custom字段对于service的分类
    this.serviceServers = {};//本台机器的服务端,使用ID关键字保存
    this.loadSers = null;//从本地文件读取的services
    this.event = new EventEmitter();
    this.init();
}

Services.prototype.init = function() {
    this.loadServices();//读取servicesforserver下的服务
}

//读取servicesforserver 下的JS文件
Services.prototype.loadServices = function()
{
    this.loadSers = UnitTools.loadDirJs("/../servicesforserver");
}


Services.prototype.startServiceServer = function(id,serviceName,ip,port,custom){
    var server = this.makeServer(serviceName,ip,port,id,custom);
    if(UnitTools.isNullOrUndefined(server))return;
    server.serverID = id;
    server.serverName = serviceName;
    server.ip = ip;
    server.port = port;
    server.custom = custom;
    this.serviceServers[id] = server;
    return server;
}

Services.prototype.starAllServices = function(){
    var self = this;
    UnitTools.forEach(this.app.getAllServersInfo(),function(index,host){
        var client = self.makeClient(host.name,host.ip,host.port);
        client.serverID = host.id;
        client.serverName = host.name;
        client.ip = host.ip;
        client.port = host.port;
        self.services[client.serverID] = client;
        UnitTools.getOrCreateArrayInJson(host.name,self.servicesWithName).push(client);//将Service信息按照名字保存起来
        if(!UnitTools.isNullOrUndefined(host.custom)){
            UnitTools.getOrCreateArrayInJson(host.custom.id,self.servicesWithCustom).push(client);
        }
    });
};


Services.prototype.getServiceWithServerID = function(serverID){//通过配置文件的ServerID获取Service
    return this.services[serverID];
}


Services.prototype.getServiceWithIP = function (ip) {
    for(var key in this.services){
        var oneService = this.services[key];
        if(oneService.ip.find(ip) != -1){
            return oneService;
        }
    }
    return null;
}

Services.prototype.getServiceWithPort = function (port) {
    for(var key in this.services){
        var oneService = this.services[key];

       if(port.toString().indexOf(oneService.port.toString()) != -1){
                   return oneService;
       }
    }
    return null;
}

//根据服务类型，随机获取service,返回rpcserver的proxy类，然后可以直接调用
Services.prototype.getRandomService = function(serviceType){
    try{
        var services = this.servicesWithName[serviceType];
        var serviceNums =  services.length;
        var random = UnitTools.random(0,serviceNums-1);
        return services[random];
    }catch (e){
        console.log(e.message);
        return null;
    }
}

//根据custom字段来获得Service
Services.prototype.getRandomServiceWithCustom = function(custom){
    try{
        var services = this.servicesWithCustom[custom];
        var serviceNums =  services.length;
        var random = UnitTools.random(0,serviceNums-1);
        return services[random];
    }catch(e){
        console.log(e);
        return null;
    }

}


//connectorServiceID连接服务器的ID，玩家的SessionID，cb的参数有,sessionID,proxy,客户端调用代理类
Services.prototype.getConnectorProxy = function(sessionID,connectServerID,cb){
    var self = this;
    var service = this.getServiceWithServerID(connectServerID);
    service.proxy.getClientProxyInfo(sessionID,function(proxyDes){
        var des = proxyDes.proxydes;
        //根据描述生成可以调用的proxy
        var proxy = self.makeServiceServerClientProxy(sessionID,service,des);
        cb(proxy);
    });
}


Services.prototype.makeServer = function(serviceName,ip,port,serviceID,custom)
{
    var server = new Server();
    var serviceDefineFunction = this.loadSers[serviceName];
    var serviceDefine = serviceDefineFunction();
    if(UnitTools.isNullOrUndefined(serviceDefine)){
        this.app.logInfo({mes:serviceName+" serviceforserver not contain"});
        return;
    }
    var service = serviceDefine.service;
    var onClientIn = serviceDefine.onClientIn;
    var onClientOut = serviceDefine.onClientOut;
    var onStart = serviceDefine.onStart;
    if(UnitTools.isNullOrUndefined(service)){
        this.app.logInfo({mes:"service file export must service item"});
    }else{
        server.addRpc(serviceDefine.service);
        server.start(port);
    }
    if(!UnitTools.isNullOrUndefined(onClientIn)){
        server.onClientIn(function(session){
            if(session.origin == "service")return;
            onClientIn(session);
        });
    }
    if(!UnitTools.isNullOrUndefined(onClientOut)){
        server.onClientClose(function(session){
            if(session.origin == "service")return;
            onClientOut(session);
        });
    }
    if(!UnitTools.isNullOrUndefined(onStart)){
        onStart(serviceID,serviceName,ip,port,custom);
    }
    return server;
}

Services.prototype.makeClient = function(serviceName,ip,port)
{
    var self = this;
    var client = new Client();
    client.connect("ws://"+ip+":"+port,"service");//设置Origin为service,这样服务端在接收到连接的时候，会判断
    client.onConnect(function(){
        self.event.emit("onServiceConnected",serviceName,ip,port,client);
    });
    client.onClose(function(){
        self.event.emit("onServiceDisConnected",serviceName,ip,port,client);
    });
    return client;
}

//根据服务端的客户端的描述，生成可以直接调用某个服务端连接的客户端，比如在游戏中服务中，直接发送数据给连接服务器的客户端中
Services.prototype.makeServiceServerClientProxy = function(sessionID,service,proxyDes){
    var proxy = {};
    UnitTools.forEach(proxyDes,function(actionName,value){
        proxy[actionName] = service.proxy.doClientProxy.bind(service.proxy,sessionID,actionName);
    });
    return proxy;
}


Services.prototype.onConnectService = function(cb)//参数包括servicename,ip,host,client
{
    this.event.on("onServiceConnected",cb);
}

Services.prototype.onDisConnectService = function(cb)//参数包括servicename,ip,host,client
{
    this.event.on("onServiceDisConnected",cb);
}

module.exports = Services;
