/**
 * Created by litengfei on 2017/4/13.
 * 简单的状态机
 */

function StateManger() {
    this.states = {};
    this.currentState = null;
}

//得到当前的状态
StateManger.prototype.getState = function () {
    return this.currentState;
}

//注册一个状态机
StateManger.prototype.registerState = function (state,cb) {
    this.states[state] = cb;
}

//移除一个状态机
StateManger.prototype.removeState = function (state) {
    delete  this.states[state];
}

//转换状态
StateManger.prototype.changeToState = function (state,customData) {
    this.customData = customData;
    this.currentState = state;
}



StateManger.prototype.update = function () {
    var self = this;
    var cb = this.states[this.currentState];
    if(typeof cb != "undefined"){
        cb(self.customData);
    }
}

module.exports = StateManger;


