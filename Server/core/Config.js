/**
 * Created by litengfei on 2017/4/14.
 */
var fs = require("fs");
var path = require("path");
function Config() {
    this.configJson = {};
}
Config.prototype.load = function (fileName) {
    var jsonString = fs.readFileSync(path.normalize(__dirname + "/../"+fileName),"utf-8");
    this.configJson = JSON.parse(jsonString);
}

Config.prototype.get = function (key) {
    return this.configJson[key];
}

Config.getServerConfig = function(){
    var config = new Config();
    config.load("config.json");
    if(config.get("mode")=="debug"){
        config.load("serverconfdebug.json");
        return config.configJson;
    }
    config.load("serverconf.json");
    return config.configJson;
}

module.exports = Config;