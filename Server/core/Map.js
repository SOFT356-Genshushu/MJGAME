/**
 * Created by litengfei on 16/10/10.
 */
var NativeMap =  Map;
var UnitTools = require("./UnitTools.js");
function HancedMap(){
    this.objects = new NativeMap();
}
HancedMap.prototype.getOrCreate = function(key){
    key = key.toString();
    if(UnitTools.isNullOrUndefined(key)){
        return;
    }
    var v1 = this.objects.get(key);
    if(UnitTools.isNullOrUndefined(v1)) {
        v1 = {};
        this.objects.set(key,v1);
    }
    return v1;
}

HancedMap.prototype.getNotCreate = function(key){
    key = key.toString();
    if(UnitTools.isNullOrUndefined(key))return;
    return this.objects.get(key);
}

HancedMap.prototype.setKeyValue = function(key,value){
    key = key.toString();
    this.objects.set(key,value);
}

HancedMap.prototype.hasKey = function(key){
    if(UnitTools.isNullOrUndefined(key))return false;
    key = key.toString();
    return this.objects.has(key);
}
HancedMap.prototype.remove = function(key){
    if(UnitTools.isNullOrUndefined(key))return;
    key = key.toString();
    this.objects.delete(key);
}

HancedMap.prototype.forEach = function(itemCb){
    this.objects.forEach(function(value,key){
        if(!UnitTools.isNullOrUndefined(itemCb)){
            itemCb(key.toString(),value);
        }
    });
}

HancedMap.prototype.getKeys = function(){
    var keys = [];
    this.forEach(function (key,value) {
        keys.push(key);
    })
  return keys;
}

HancedMap.prototype.getValues = function(){
    var values = [];
    this.forEach(function (key,value) {
        values.push(value);
    })
    return values;
}

HancedMap.prototype.count = function () {
    return this.objects.size;
}

HancedMap.prototype.log = function(){
    this.objects.forEach(function(value,key){
        console.log("key "+key);
        console.log("value");
        console.log(value);
    })
}
module.exports = HancedMap;


// var map1 = new HancedMap();
// console.log("getOrCreate");
// var a = map1.getOrCreate("1");
// console.log(map1.count());
// console.log(a);
//
// console.log("setKeyValue");
// map1.setKeyValue(1,"2");
// console.log(map1.getNotCreate("1"));
// console.log(map1.getNotCreate(1));
// console.log(map1.getOrCreate(1));
//
// console.log("getKeys");
// console.log(map1.getKeys());
//
// console.log("getValues");
// console.log(map1.getValues());
//
// console.log("hasKey");
// console.log(map1.hasKey(1));
// console.log(map1.hasKey("1"));
//
//
// console.log("forEach");
// map1.forEach(function (key,value) {
//     console.log(key);
//     console.log(value);
// })
//
// console.log("getKeys");
// console.log(map1.getKeys());
//
// console.log("getValues");
// console.log(map1.getValues());
//
// console.log("remove");
// map1.remove("1");
// console.log(map1.hasKey(1));





