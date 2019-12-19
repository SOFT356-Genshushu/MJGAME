/**
 * Created by litengfei on 2017/9/13.
 */

var UnitTools = require("./UnitTools.js");
var RedisAsync = require("./RedisAsync.js");

//需要统一实现接口  set(key,value) get(key,valueNames)
class RedisCache{
    constructor(config){
        this.redis = new RedisAsync(config.db,config.pass,config.ip,config.port);
    }

    /**
     * 参数与redis的参数一致 key name value  name1 value1 ...
     * @returns {Promise.<void>}
     */
    async set (key,jValue){
        var ok =  this.redis.redisClient.hmset(key,jValue);
        if(ok == "OK")return true;
        return false;
    }

    /**
     * 参数与redis的参数与一致  key name1 name2
     * @returns {Promise.<void>}
     */
    async get (key){
        var values =  await this.redis.redisClient.hmget(arguments);
        var jValue = {};

        var names = UnitTools.changeFunctionArgsToArray(arguments,1);
        for(var key in names){
            jValue[names[key]] = values[key];
        }
        return jValue;
    }

    watch(key){
        this.redis.redisClient.watch(key);
    }

    /**
     * check-and-set操作
     * @param key 需要锁定的键
     * @param jValue 需要设置的json
     * @returns {Promise.<void>}
     */
    async setWithCAS(key,jValue){
        this.watch(key);
        var result = await this.redis.redisClient.multi().hmset(key,jValue).exec();
        return new Promise(function (resolve,reject) {
            if(result[0][0]){
               resolve(false);
               return;
            }
            resolve(true);
        });
    }
}

module.exports = RedisCache;