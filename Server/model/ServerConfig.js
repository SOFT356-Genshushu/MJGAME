/**
 * Created by litengfei on 2017/9/29.
 */
var Config = require("./../core/Config.js");
class ServerConfig{

}

ServerConfig.init = function () {
    var config = new Config();
    config.load("config.json");
    var mode = config.get("mode");
    var serverConfigPath = "serverconf.json";
    if(mode == "debug")serverConfigPath = "serverconfdebug.json";

    ServerConfig.config = new Config();
    ServerConfig.config.load(serverConfigPath);

}

ServerConfig.get = function (key) {
    return ServerConfig.config.get(key);
}

ServerConfig.init();
module.exports = ServerConfig;