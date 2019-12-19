/**
 * Created by litengfei on 2017/5/23.
 */
function AreaValue() {
    this.infos = [];
}

AreaValue.prototype.push = function (from,to,value) {
    this.infos.push({from:from,to:to,value:value});
}

AreaValue.prototype.getValue = function (data) {
    var numValue = parseFloat(data);
    for(var key in this.infos){
        var oneInfo = this.infos[key];
        if(numValue>= oneInfo.from && numValue <= oneInfo.to){
            return oneInfo.value;
        }
    }
    return null;
}

AreaValue.prototype.acceptAreaJson = function (areaJson) {
    for(var key in areaJson){
        var data = areaJson[key];
        this.push(data.from,data.to,data.value);
    }
}

module.exports = AreaValue;