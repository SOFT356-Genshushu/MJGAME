
//超时简单小功能
function TimeOut(timeOut)
{
    this.startTime = 0;
    this.timeOut = timeOut;
}
//设置超时时间
TimeOut.prototype.setTimeOut = function(timeOut)
{
    this.timeOut = timeOut;
}

//是否超时
TimeOut.prototype.isTimeOut = function()
{
    var delta = Date.now() - this.startTime;
    if(delta >= this.timeOut)return true;
    return false;
}

//开始超时
TimeOut.prototype.startTimeOut = function()
{
    this.startTime = Date.now();
}

module.exports = TimeOut;