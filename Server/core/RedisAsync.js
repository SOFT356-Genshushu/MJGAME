/**
 * Created by litengfei on 2017/9/11.
 */
var Redis = require('ioredis');
class RedisAsync {
    constructor(db,pass,ip,port){
        this.redis = new Redis({
            port: port,          // Redis port
            host: ip,   // Redis host
            password: pass,
            db: db
        });
    }
    get redisClient(){
        return this.redis;
    }
}
module.exports = RedisAsync;

// var assert = require("assert");
// var RedisAsync = require("./../core/RedisAsync.js");
//
// describe("创建Redis实例",function () {
//     before(function () {
//         this.redis = new RedisAsync(0,"123456","123.57.180.49",6379);
//     })
//     it("创建成功，添加变量",async function () {
//         var name2Value = await this.redis.redisClient.get("name2");
//         assert(name2Value,123);
//     })
// })