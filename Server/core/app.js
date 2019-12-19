/**
 * Created by litengfei on 16/6/28.
 */

var fs = require("fs");
var UnitTools = require("./UnitTools.js");
var DebugHelper = require("./DebugHelper");
var Services = require("./Services.js");
var RedisCache = require("./RedisCache.js");
var Log = require("./Log.js");
var path = require("path");
var Sequelize = require("sequelize");
function App() {
    this.appConfig = {};
    this.services = null;
    this.connectServers = [];//连接服务器的数组
    this.totalServersInfo = null;//所有服务器的信息数组
    this.startServersInfo = null;//启动服务器的数据
    this.totalserverInfoIds = {};

    this.currentServerID = null;//当前服务器ID
    this.currentServerType = null;//当前进程类型
    this.currentServerName = null;//当前进程名称
    this.currentServerHost = null;//当前进程的HOST
    this.cache = null;//系统缓存
    this.sequelize = null;//默认的数据库处理
    this.sequelizes = {};//可能有多个数据库

    this.log = new Log("app", path.normalize(__dirname + "/../logs/app.log"));//日志输出地址
}

App.prototype.loadAppConfig = function () {
    var filePath = this.isDebug ? path.normalize(__dirname + "/../serverconfdebug.json") : path.normalize(__dirname + "/../serverconf.json");
    this.appConfig = JSON.parse(fs.readFileSync(filePath));

    //输出标识
    var logMaks = this.appConfig["logmask"];
    if(logMaks){
        DebugHelper.init(logMaks);
        console.log("DebugHelper输出标识 %s",logMaks);
    }

    //初始化缓存
    var cacheConfig = this.appConfig["cache"];
    if (!UnitTools.isNullOrUndefined(cacheConfig)) {
        if (cacheConfig.type == "redis") {
            console.log("\n初始化redis缓存:");
            this.cache = new RedisCache(cacheConfig.config);
            console.log(cacheConfig.config);
            console.log("redis初始化完成\n");
        }
    }
}

App.prototype.getAllServersInfo = function () {//获得所有的Server
    if (this.totalServersInfo != null)return this.totalServersInfo;
    this.totalServersInfo = [];
    var gateInfo = this.getGateServerInfo();
    if (!UnitTools.isNullOrUndefined(gateInfo)) {
        this.totalServersInfo = this.totalServersInfo.concat(gateInfo);
    }
    var connectInfo = this.getConnectorServerInfo();
    if (!UnitTools.isNullOrUndefined(connectInfo)) {
        this.totalServersInfo = this.totalServersInfo.concat(connectInfo);
    }
    var serviceInfo = this.getServiceServerInfo();
    if (!UnitTools.isNullOrUndefined(serviceInfo)) {
        this.totalServersInfo = this.totalServersInfo.concat(serviceInfo);
    }
    return this.totalServersInfo;
};

App.prototype.getStartServersInfo = function ()//根据配置文件，得到本机需要启动的Server
{
    if (this.startServersInfo != null)return this.startServersInfo;
    this.startServersInfo = [];
    var totalServers = this.getAllServersInfo();
    var startServers = this.startServersInfo;
    UnitTools.forEach(totalServers, function (index, host) {
        if (UnitTools.isIpInLocal(host.ip)) {
            startServers.push(host);
        }
    });
    return startServers;
}

App.prototype.getGateServerInfo = function () {//得到配置文件中的Gate的信息
    var gate = this.getGateInfo();
    if (UnitTools.isNullOrUndefined(gate))return null;
    return {type: "gate", name: "gate", id: gate.id, ip: gate.ip, port: gate.port};
}

App.prototype.getConnectorServerInfo = function () {//得到配置文件中Connector的信息
    var conns = this.getConnectorsInfo();
    if (UnitTools.isNullOrUndefined(conns))return null;
    var connsa = [];
    UnitTools.forEach(conns, function (index, connector) {
        connsa.push({type: "connector", name: "connector", id: connector.id, ip: connector.ip, port: connector.port});
    });
    return connsa;
}


App.prototype.getServiceServerInfo = function () {//得到配置文件中Service的信息
    var services = this.getServicesConfig();
    if (UnitTools.isNullOrUndefined(services))return null;
    var serviceTypes = [];
    UnitTools.forEach(services, function (serviceName, service) {
        var hosts = service.hosts;
        UnitTools.forEach(hosts, function (index, host) {
            serviceTypes.push({
                type: "service",
                name: serviceName,
                id: host.id,
                ip: host.ip,
                port: host.port,
                custom: host.custom
            });
        });
    });
    return serviceTypes;
}


App.prototype.getGateInfo = function () {
    return this.appConfig["gate"];
}

App.prototype.getConnectorsInfo = function () {
    return this.appConfig["connectors"];
}

App.prototype.getServicesConfig = function () {
    return this.appConfig["services"];
}

App.prototype.getServices = function ()//获得启动的服务类
{
    return this.services;
}

App.prototype.getRandomService = function (type) {
    return this.services.getRandomService(type);
}

//获取service并且Onready
App.prototype.getRandomServiceAndOnReady = function (typeString, cb) {
    if (!UnitTools.isFunction(cb))return;
    var service = this.getRandomService(typeString);
    if (service) {
        service.onReady(cb);
    }
}

App.prototype.getRandomServiceWithCustom = function (custom) {
    return this.services.getRandomServiceWithCustom(custom);
}

App.prototype.getServiceWithServerID = function (serverID) {
    return this.services.getServiceWithServerID(serverID);
}

App.prototype.getServiceWithServerPort = function (urlWithPort) {
    return this.services.getServiceWithPort(urlWithPort);
}

App.prototype.getServiceWithServerIDOnReady = function (serverID, cb) {
    if (!UnitTools.isFunction(cb))return;
    var service = this.getServiceWithServerID(serverID);
    if (service) {
        service.onReady(cb);
    }
}

App.prototype.getServiceWithServerPortOnReady = function (urlWithPort, cb) {
    if (!UnitTools.isFunction(cb))return;
    var service = this.getServiceWithServerPort(urlWithPort);
    if (service) {
        service.onReady(cb);
    }
}


//获得分布式下当前的service
App.prototype.getCurrentService = function () {

}

App.prototype.getConnectorProxy = function (sessionID, connectServerID, cb) {
    this.services.getConnectorProxy(sessionID, connectServerID, cb);
}

//得到当前服务器ID
App.prototype.getCurrentServerID = function () {
    return this.currentServerID;
}
//得到当前服务的类型
App.prototype.getCurrentServerType = function () {
    return this.currentServerType;
}

//得到当前服务器的名字
App.prototype.getCurrentServerName = function () {
    return this.currentServerName;
}

//得到当前服务器的ip和port
App.prototype.getCurrentHost = function () {
    return this.currentServerHost;
}


App.prototype.showServerInfo = function (type, id, name, ip, port) {
    var str = UnitTools.formatStr("type:{0} id:{1} name:{2} ip:{3}  port:{4} + 启动了", type, id, name, ip, port)
    console.log(str);
}

//判断ID是否是服务器的ID
App.prototype.isIdOnOfTheServe = function (serverID) {
    return UnitTools.hasKey(this.getAllServersInfo(), serverID);
}

App.prototype.startGateServer = function (id, name, ip, port) {//启动Gate服务器
    this.gateServer.init(id, name, ip, port, this);
    this.gateServer.start();
    this.showServerInfo("gate", id, name, ip, port);
}

App.prototype.startConnectorServer = function (id, name, ip, port) {//启动连接服务器
    var connectServer = new ConnectorServer();
    connectServer.init(id, name, ip, port);
    this.connectServers.push(connectServer);
    connectServer.start(port);
    this.showServerInfo("connector", id, name, ip, port);
}

App.prototype.startServiceServer = function (id, name, ip, port, custom) {//启动service服务器
    var server = this.services.startServiceServer(id, name, ip, port, custom);//启动服务
    this.showServerInfo("service", id, name, ip, port);
    return server;
}

App.prototype.starAllServices = function () {//启动所有的服务访问，包括connector 和 gate
    this.services.starAllServices();
}

App.prototype.startServer = function (type, id, name, ip, port, custom) {
    switch (type) {
        case "gate":
            this.startGateServer(id, name, ip, port);
            break;
        case "connector":
            this.startConnectorServer(id, name, ip, port);
            break;
        case "service":
            this.startServiceServer(id, name, ip, port, custom);//分布式下获得当前的server
            break;
    }
    this.currentServerType = type;
    this.currentServerName = name;
    this.currentServerID = id;
    this.currentServerHost = {ip: ip, port: port};
}
App.prototype.startAll = function ()//单机模式下，在一个程序中启动所有服务
{
    var self = this;
    this.loadAppConfig();//读取配置文件
    this.services = new Services(this);

    //启动服务器

    var startServerInfo = this.getStartServersInfo();
    UnitTools.forEach(startServerInfo, function (index, host) {
        self.startServer(host.type, host.id, host.name, host.ip, host.port, host.custom);
    });

    //启动服务客户端
    this.starAllServices();
}

App.prototype.startWithArgs = function () {//根据传递的参数启动服务
    if (process.argv.length != 8)return;
    var type = process.argv[2];
    var id = process.argv[3]
    var name = process.argv[4];
    var ip = process.argv[5];
    var port = process.argv[6];
    var custom = process.argv[7];
    UnitTools.setProcessInfo("tongfei", name, ip, id);
    this.loadAppConfig();
    this.services = new Services(this);
    try {
        custom = JSON.parse(custom);
    } catch (e) {

    }
    this.startServer(type, id, name, ip, port, custom);
    //启动服务客户端
    this.starAllServices();
}

////程序安全调用，每一个程序都使用SafeFunction，这样防止有程序运行错误，影响其他程序正常运行
App.prototype.safeFunction = function (content, func) {
    try {
        if (UnitTools.isFunction(content)) {
            return content();
        }

        if (content) {
            return func.apply(content);
        } else {
            return func();
        }
    } catch (e) {
        this.logError({saveFunctionError: e.message});
        return;
    }
}

App.prototype.requireLogic = function (logicName) {
    return require("./../logic/" + logicName);
}

//app输出信息
App.prototype.logInfo = function (info) {
    this.log.logInfo(info);
}

App.prototype.logError = function (error) {
    this.log.logError(error);
}

App.prototype.logImportant = function (im) {
    this.log.logImportant(im);
}

App.prototype.logMessage = function () {
    this.log.logMessage(arguments);
}

App.prototype.debug = function () {
    var args = Array.prototype.slice.call(arguments, 0, arguments.length);
    DebugHelper.debug.apply(DebugHelper.debug, args);
}

//注意，这两个函数是在运行connector的机器上才会响应，其他的server上不会响应
App.prototype.onClientIn = function (cb) {
    var self = this;
    UnitTools.forEach(this.connectServers, function (index, server) {
        server.server.onClientIn(function (session) {
            if (session.origin == "service")return;
            cb(session);
        });
    });
}

App.prototype.onClientClose = function (cb) {
    UnitTools.forEach(this.connectServers, function (index, server) {
        server.server.onClientClose(function (session) {
            if (session.origin == "service")return;
            cb(session);
        })
    });
}


App.instance = null;
module.exports = App;

//app.showServerInfo("1",2,3,4,5);






