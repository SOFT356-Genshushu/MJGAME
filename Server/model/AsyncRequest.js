/**
 * Created by litengfei on 2017/9/14.
 */
var rq = require("request-promise-native");
class AsyncRequest{
    /**
     * 请求一个地址
     * @param url 请求的地址
     * @param type 字符串 json 序列化为字符串 string 直接返回string
     * @return {Promise.<void>}
     */
    static async request(url,type = "json"){
        var body = {};
        try{
            body = await rq(url);
        }catch (e){
            return await new Promise(function (resole,reject) {
                resole(false);
            })
        }
        if(type == "json"){
           return await new Promise(function (resole,reject) {
               try{
                   var value = JSON.parse(body);
                   resole(value);
               }catch (e){
                   resole(false);
               }
           })
        }
        return await new Promise(function (resole,reject) {
            resole(body);
        })
    }
}
module.exports = AsyncRequest;


// (async function () {
//    var result = await AsyncRequest.request("http://www.baasdidu1.com","string");
//    console.log(result);
// })()

