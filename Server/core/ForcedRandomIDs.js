/**
 * Created by litengfei on 2017/6/15.
 */
var UnitTools = require("./UnitTools.js");
function ForcedRandomIDs() {
    this.unUsedID = new Map();//还没使用的ID
}


ForcedRandomIDs.prototype.generateIDs = function (from,to) {//生成ID
    var self = this;
    var temp = [];
    for(var i = from;i<=to;i++){
        temp.push(i);
    }
    //打乱顺序
    temp = UnitTools.washArray(temp);
    UnitTools.forEach(temp,function (index,value) {
        self.unUsedID.set(value,1);
    })
    return temp;
}


ForcedRandomIDs.prototype.getID = function () {
   var  iterator = this.unUsedID.entries();
   iterator = iterator.next();
   if(!iterator.done){
       var id = iterator.value[0];
       this.unUsedID.delete(id);
       return id;
   }
   return null;
}

//回收ID，可以继续使用
ForcedRandomIDs.prototype.reUseID = function (id) {
    this.unUsedID.set(id,1);
}

ForcedRandomIDs.prototype.removeID = function (id) {
    this.unUsedID.set(id,1);
}

module.exports = ForcedRandomIDs;
