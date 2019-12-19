var Score = function () {

}

var proto = Score.prototype;

module.exports = new Score();

proto.score = function (posHuType,dianpaoPos = 0,posHuSpecial) {//计算分数  
    var posCount = 4;
    var baseScore = 1;
    var ZimoTime = 2;
    var specialTime = {
        0:2,//清一色
    }
    var posScore = new Array(4);
    posScore.fill(0);

    var addScore = function (pos,score) {
        posScore[pos]+=score;
    }

    var addScoreExcept = function (ePos,score) {
        for(var pos=0;pos<posCount;pos++){
            if(pos == ePos)continue;
            posScore[pos]+=score;
        }
    }

    var getSpecialScore = function (pos) {
        var specialScore = 1;
            var selfSpecial = posHuSpecial[pos];
            if(selfSpecial){
                for(var idx in selfSpecial){
                    var specialType = selfSpecial[idx];
                    specialScore*=specialTime[specialType];
                }
            }
        return specialScore;
    }

    var huPoss = Object.keys(posHuType);
    var isLiuju = huPoss.length == 0?true:false;
    if(isLiuju){//流局
        
    }else{//非流局
        var oneHuType = posHuType[huPoss[0]];
        if(oneHuType == 5){//点炮
            for(var idx in huPoss){
                var huPos = huPoss[idx];
                var winScore = baseScore * getSpecialScore(huPos);
                addScore(huPos,winScore);
                addScore(dianpaoPos,-winScore);
            }
            
        }else if(oneHuType == 6){//自摸
            var sScore = getSpecialScore(huPoss[0]);
            var zimo_score = 3 * (baseScore * ZimoTime * sScore);
            addScore(huPoss[0],zimo_score);
            addScoreExcept(huPoss[0],-zimo_score/3);
        }
    }
    return posScore;
}

//-------------------------快速测试

/*var soreInstance = new Score();

{//流局分数测试
    var score = soreInstance.score({},0,{});
    console.log(score);
    console.log(score[3]== 0 && score[0] == 0);
}

{//自摸分数测试
    var score = soreInstance.score({3:6},0,{});
    console.log(score);
    console.log(score[3]== 6 && score[0] == -2);
}

{//自摸清一色测试
    var score = soreInstance.score({3:6},0,{3:[0]});
    console.log(score);
    console.log(score[3]== 12 && score[0] == -4);
}

{//点炮测试
    var score = soreInstance.score({3:5},0,{});
    console.log(score);
    console.log(score[3]== 1 && score[0] == -1);
}

{//点炮清一色测试
    var score = soreInstance.score({3:5},0,{3:[0]});
    console.log(score);
    console.log(score[3]== 2 && score[0] == -2);
}*/