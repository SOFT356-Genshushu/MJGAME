var ConsistentHash = require('consistent-hash');
var Config = require('./../core/Config.js');
class ServerBlance{

    constructor(){
        this.hrs = {};
        this.initFromServerConf();
    }

    static getInstance(){
        if(ServerBlance.g_Instance === null){
            ServerBlance.g_Instance = new ServerBlance();
        }
        return ServerBlance.g_Instance;
    }

    initFromServerConf(){
        var config = Config.getServerConfig();
        config = config.serverblance    ;
        for(var serviceName in config){
            var ips = config[serviceName];
            for(var index in ips){
                var oneIp = ips[index];
                this.addIp(serviceName,oneIp);
            }
        }
    }

    addIp(serviceName,ip){
        var hr;
        if(typeof this.hrs[serviceName] === "undefined"){
            hr = new ConsistentHash({range:100});
            this.hrs[serviceName] = hr;
        }
        hr = this.hrs[serviceName];
        hr.add(ip);
    }

    getIp(serviceName,id){
        var hr = this.hrs[serviceName];
        return hr.get(id);
    }


}

ServerBlance.g_Instance = null;

module.exports = ServerBlance;