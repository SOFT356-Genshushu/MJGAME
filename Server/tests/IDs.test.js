var IDs = require('./../core/IDs.js');
var Assert = require('assert');

describe('生成随机ID测试',function () {
    this.timeout(22126);
    it('创建并返回一个有效ID',async function () {
        var ids = new IDs();
        ids.initFromConfig();
        var id = await ids.getId();
        console.log(id);
        if(id>=10000000 && id<=99999999){
            Assert.equal(true,true);
        }else{
            Assert.equal(false,false);
        }
    });
});