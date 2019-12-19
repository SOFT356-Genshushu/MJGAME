/**
 * Created by litengfei on 16/7/1.
 */
var bunyan = require('bunyan');
function Log(name,filePath) {
    this.name = name;
    this.filePath = filePath;
    this.log =  bunyan.createLogger({"name":name,streams:[{stream:process.stdout},{path:filePath}]});
}
//LogInfo消息
Log.prototype.logInfo = function(infoJson){
    this.log.info({info:infoJson});
}

//重要的消息，比如玩家得到奖励的信息,为后来数据恢复找回提供依据
Log.prototype.logImportant = function(imJson){
    this.log.info({important:imJson});
}

Log.prototype.logError = function(errorJson){
    this.log.error({error:errorJson});
}

Log.prototype.logMessage = function () {
    this.log.info(arguments);
}

module.exports = Log;