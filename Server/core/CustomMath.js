/**
 * Created by litengfei on 2017/4/11.
 */
function CustomMath() {
    
}

//连乘
CustomMath.Liancheng = function (baseValue,times) {
    var result = 1;
    for(var i = 0;i<times;i++){
        result*=baseValue;
    }
    return result;
}

module.exports = CustomMath;