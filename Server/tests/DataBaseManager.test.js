const DataBaseManager = require('./../Theme/FangkaMajiang/db/DataBaseManager');

const Assert = require('assert');

describe('测试数据库连接', function () {
    var ins = DataBaseManager.instance();
    it('必须返回ture',async function () {
        var ok = await ins.initDB("root","123456","127.0.0.1","27017","MaJiang");
        Assert.equal(true,ok);
    });

    it('创建一个用户成功',async function () {
        var okInfo = await ins.createPlayer(123456,"xxx2","123456",0);
        Assert.equal(okInfo.account,"xxx2");
    });

    it('查询account为xxx的玩家',async function () {
        var okInfo = await ins.findPlayer("xxx");
        Assert.equal(okInfo[0].account,"xxx");
    });
});