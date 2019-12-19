/**
 * Created by litengfei on 2017/5/9.
 */

var UnitTools = require("./UnitTools.js");
function RandomIDs(from,to) {
    this.from = from;
    this.to = to;

    this.ids = {};
}
RandomIDs.prototype.getID = function () {
    var id = UnitTools.random(this.from,this.to);
    if(!UnitTools.isNullOrUndefined(this.ids[id])){
        return this.getID();
    }
    this.ids[id] = 1;
    return id;
}
RandomIDs.prototype.removeID = function (id) {
    delete  this.ids[id];
}

module.exports = RandomIDs;

// var randomID = new RandomIDs(0,1);
//
// console.log(randomID.getID());
// console.log(randomID.getID());
// console.log(randomID.getID());