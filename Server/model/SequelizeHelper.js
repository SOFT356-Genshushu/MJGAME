/**
 * Created by litengfei on 2017/9/18.
 */

class SequelizeHelper{
    static async getInfo(instance,whereJson,attributes){
        var info = await instance.findOne({where:whereJson,attributes:attributes,plain:true});
        if(info) return Promise.resolve(info.dataValues);
        return Promise.resolve(null);
    }
    static async updateInfo(instance,values,whereJson,attributes = []){
        return await instance.update(values,{where:whereJson,attributes:attributes,returning:true,plain:true});
    }
}
module.exports = SequelizeHelper;