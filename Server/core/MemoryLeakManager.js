/**
 * Created by litengfei on 2017/3/27.
 */
var memwatch = require('memwatch-next');
var heapdump = require('heapdump');
class MemoryLeakManager{
    constructor(){

    }

    static writeMemory(path){
        heapdump.writeSnapshot(path +"//"+ Date.now() + '.heapsnapshot');
    }

    static autoWatchMemory(path){//自动监测内存溢出，然后将泄漏信息写在固定的文件里
        memwatch.on('leak', function(info) {
            heapdump.writeSnapshot(path +"//"+ Date.now() + '.heapsnapshot');
        });
    }
}
module.exports = MemoryLeakManager;
