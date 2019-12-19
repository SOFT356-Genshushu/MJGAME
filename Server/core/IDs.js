const Config = require('./Config.js');
const UnitTools = require('./UnitTools.js');
const fs = require('fs');
class IDs{
    constructor(){

    }
    initFromConfig(){
        this.idConfig = Config.getServerConfig().ids;
        if(this.idConfig.create){
            this.generateIdsToFile(this.idConfig.from,this.idConfig.to,__dirname+"/../"+this.idConfig.path,__dirname+"/../"+this.idConfig.countpath);
        }
    }

    initFromTableIdConfig(){
        this.tableIdConfig = Config.getServerConfig().tableIdConfig;
        if(this.tableIdConfig.create){
            this.generateIdsToFile(this.tableIdConfig.from,this.tableIdConfig.to,__dirname+"/../"+this.tableIdConfig.path,__dirname+"/../"+this.tableIdConfig.countpath);
        }
    }

    generateIdsToFile(from,to,filePath,countFilePath){
        var numIdCount = (to-from)+1;
        var buffer = new Buffer(4*numIdCount);
        for(var i=from; i<=to;i++){
            var start = i-from;
            start = start *4;
            buffer.writeUInt32LE(i,start);
        }
        for(var i=0;i<numIdCount;i++){
            var randomIndex = UnitTools.random(0,numIdCount-1);
            var currentNum = buffer.readUInt32LE(i*4);
            var changeNum = buffer.readUInt32LE(randomIndex*4);

            buffer.writeUInt32LE(changeNum,i*4);
            buffer.writeUInt32LE(currentNum,randomIndex*4);
        }

        fs.writeFileSync(filePath,buffer,{flag:"w"});
        fs.writeFileSync(countFilePath,0,{flag:"w"});
    }

    async getId(){
        var self = this;
        return new Promise(function (resolve,reject) {
            var countNum = parseInt(fs.readFileSync(__dirname+"/../"+self.idConfig.countpath,"utf-8"));
            var startBufferIndex = countNum*4;
            var stream = fs.createReadStream(__dirname+"/../"+self.idConfig.path,{start:startBufferIndex,end:startBufferIndex+4,flag:"r"});
            stream.on("data",function (dataBuffer) {
                var id = dataBuffer.readUInt32LE(0);
                resolve(id);
                fs.writeFileSync(__dirname+"/../"+self.idConfig.countpath,countNum+1);
            }); 
        });
    }

    async getTableId(){
        var self = this;
        return new Promise(function (resolve,reject) {
            var countNum = parseInt(fs.readFileSync(__dirname+"/../"+self.tableIdConfig.countpath,"utf-8"));
            var startBufferIndex = countNum*4;
            var stream = fs.createReadStream(__dirname+"/../"+self.tableIdConfig.path,{start:startBufferIndex,end:startBufferIndex+4,flag:"r"});
            stream.on("data",function (dataBuffer) {
                var id = dataBuffer.readUInt32LE(0);
                resolve(id);
                fs.writeFileSync(__dirname+"/../"+self.tableIdConfig.countpath,countNum+1);
            }); 
        });
    }
}

module.exports = IDs;