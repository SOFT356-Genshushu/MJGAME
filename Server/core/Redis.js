/**
 * Created by litengfei on 16/6/21.
 */
var RedisModel = require("redis")
var BlueBird = require("bluebird");
function Redis(pass,ip,port,cb)
{
    BlueBird.promisifyAll(RedisModel.RedisClient.prototype);
    BlueBird.promisifyAll(RedisModel.Multi.prototype);
    this.client = RedisModel.createClient({host:ip,port:port,password:pass});
    this.client.on("ready",function()
    {
        cb();
    });
}
Redis.prototype.objectToArray = function(ob)
{
    var array = [];
    for(var key in ob)
    {
        array.push(key);
        array.push(ob[key]);
    }
    return array;
}

Redis.prototype.getRedisClient = function(){
    return this.client;
}
module.exports = Redis;