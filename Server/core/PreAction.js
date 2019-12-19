/**
 * Created by litengfei on 2017/9/13.
 */

//根据配置文件的预处理信息，进行预处理

var isDebug = true;
var path = require("path");
var fs = require("fs");
var cmd = require('node-cmd');
var filePath = isDebug ? path.normalize(__dirname + "/../serverconfdebug.json") : path.normalize(__dirname + "/../serverconf.json");
var config = JSON.parse(fs.readFileSync(filePath));

var preaction = config["preaction"];

if (preaction) {
    var scripts = preaction["script"];
    for (var index  in scripts) {
        var cmdStr = scripts[index];
        console.log("执行:"+cmdStr);
        cmd.run(cmdStr);
    }
}
