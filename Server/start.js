//读取config.json文件
var config = new (require("./core/Config.js")) ();
config.load("config.json");
var develop = config.get("mode") == "debug"?true:false;

var App = require("./core/app.js");
var app = new App();
App.instance = app;
app.isDebug = develop;//设置是不是调试模式

var UnitTools = require("./core/UnitTools.js");

//错误捕获
UnitTools.processError(function(err){
   //app.logError({mes:err.message,stack:err.stack});
   console.log(err.stack);
})

process.on('unhandledRejection',(reason,p) => {
    console.log("Unhandled Rejection at Promise", p, "reason", reason);
});

//设置进程名称
UnitTools.setProcessInfo("tongfei","主控",UnitTools.getLocalIps(false)[1],"main");
if(develop == true)//调试模式，单一线程启动所有服务
{
    app.startAll();
    return;
}

app.loadAppConfig();//读取配置文件

var logInfo  = function(data){
    console.log(data);
}
var startHosts = app.getStartServersInfo();

UnitTools.forEach(startHosts,function(index,host){
    var custom = host.custom;
    if(UnitTools.isJson(host.custom)){
        custom = JSON.stringify(host.custom);
    }
    UnitTools.startNewProcess([__dirname+"/core/StartApp.js",host.type,host.id,host.name,host.ip,host.port,custom],logInfo,logInfo,logInfo);
});

