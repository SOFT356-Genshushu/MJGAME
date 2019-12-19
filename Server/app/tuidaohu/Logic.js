var Stam = require('./../../core/StateManger.js');
var Majiang = require('./../share/Chess.js').Majiang;
var UnitTools = require("./../../core/UnitTools.js"); 
var User = require('./User.js');
var Message =require('./../tuidaohu/Message.js');
var Rule = require('./../share/Rule.js');
var Score = require('./Score.js');

class Action{
    constructor(actionId){
        this.actionTime = Date.now();
        this.actionId = actionId;
        this.actionData = null;
        this.respond = {};
        this.waitPoss=[];
        this.type = 1;//1表示检测别人打出来的牌 2 表示检测自己摸的牌
    }

    setRespond(pos,data){//设置玩家回复消息
        this.respond[pos] = data;
    }

    getRespond(pos){//得到玩家回复消息
        return this.respond[pos];
    }

    isRespond(pos){//判断玩家是否回复消息
        return !UnitTools.isNullOrUndefined(this.respond[pos]);
    }

    setActionData(actionData){
        this.actionData = actionData;
    }

    getActionData(){
        return this.actionData;
    }
    
    addWaitPos(pos){
        this.waitPoss.push(pos);
    }

    getWaitPoss(){
        return this.waitPoss;
    }

}

class Logic{
    constructor(tab){
        this.tab = tab;
        this.washCards = null;//洗完后的牌
        this.handCards = new Array(this.tab.posCount);//牌型数量数组
        
        this.rawHandCard = new Array(this.tab.posCount);//手中原始牌数组

        this.handActions = new Array(this.tab.posCount);//保存手里的动作（杠碰）

        this.raceScores = {};//保存每句的分数

        for(var pos=0; pos<this.tab.posCount; pos++){
            var a = this.handCards[pos] = new Array(35);
            a.fill(0);
            this.rawHandCard[pos] = {};
            this.handActions[pos] = [];//每个玩家的动作类型
            this.raceScores[pos] = [];//每局每人的分数
        }
        this.mainPos = null;//庄家位置
        this.frames =[];
        this.touchIndex = 0;
        this.touchPos = null;//当前摸牌位置
        this.toHitPos = null;//当前轮到谁打牌位置
        this.curHitCardIndex = null;//当前打的牌
        this.curTouchCardIndex = null;//当前摸到的牌
        this.actionId = 0;
        this.action = null;//当前用户动作
        this.hitTimeOut = 2000;
        this.juNum = 0;//局数默认是零


        this.Stam = new Stam();
        this.Stam.registerState(1,this.waitingP.bind(this));//1 waiting
        this.Stam.registerState(2,this.washPTest.bind(this));//2 wash card (washP)
        this.Stam.registerState(3,this.hitP.bind(this));//3 hit card
        this.Stam.registerState(4,this.actionP.bind(this));//动作等待
        this.Stam.registerState(5,this.prpareP.bind(this));//准备阶段
        this.Stam.changeToState(1);
    }
    
    clearToContinue(){
        this.washCards = null;//洗完后的牌
        this.handCards = new Array(this.tab.posCount);//牌型数量数组
        this.rawHandCard = new Array(this.tab.posCount);//手中原始牌数组
        this.handActions = new Array(this.tab.posCount);//保存手里的动作（杠碰）
        for(var pos=0; pos<this.tab.posCount; pos++){
            var a = this.handCards[pos] = new Array(35);
            a.fill(0);
            this.rawHandCard[pos] = {};
            this.handActions[pos] = [];//每个玩家的动作类型
        }
        this.mainPos = null;//庄家位置
        this.touchIndex = 0;
        this.touchPos = null;//当前摸牌位置
        this.toHitPos = null;//当前轮到谁打牌位置
        this.curHitCardIndex = null;//当前打的牌
        this.curTouchCardIndex = null;//当前摸到的牌
        this.actionId = 0;
        this.action = null;//当前用户动作   
    }

    sendSpecialAndSave(pId,eventName,data){
        User.send(pId,eventName,data);
        this.frames.push({type:"special",pId:pId,eventName:eventName,data:data})
    }

    sendGroupAndSave(specials,eventName,data){
        var dataS = this.handleGroupData(data);
        this.tab.eachPos(function (pos) {
            var pId = this.tab.getPidWithPos(pos);
            var realData = UnitTools.arrayHasValue(pId,specials)?data:dataS;
            User.send(pId,eventName,realData);
        }.bind(this));

        this.frames.push({type:"group",specials:specials,eventName:eventName,data:data,dataS:dataS});   
    }

    handleGroupData(data){
        var dataS ={};
        for(var key in data){
            var value = data[key];
            if(key.indexOf("_s")!=-1)continue;
            dataS[key] = value;
        }
        return dataS;
    }

    getRestoreFrames(pId){
        var frames = [];
        for(var idx in this.frames){
            var frame = this.frames[idx];
            if(frame.type =='special' && pId == frame.pId){
                frames.push(frame);
                continue;
            }
            if(frame.type == 'group'){
                var realData = UnitTools.arrayHasValue(pId,frame.specials)?frame.data:frame.dataS;
                frames.push({type:'group',eventName:frame.eventName,data:realData});
            }
        }
        return frames;
    }

    manageCard(pos,cardIndex){
        this.rawHandCard[pos][cardIndex] = cardIndex; 
        var tIndex = Majiang.tIndex(cardIndex);
        this.handCards[pos][tIndex]+=1;
    }

    unmanageCard(pos,cardIndex){
        delete this.rawHandCard[pos][cardIndex]; 
        var tIndex = Majiang.tIndex(cardIndex);
        this.handCards[pos][tIndex]-=1;
    }

    selectCardIndexs(pos,cardIndex,num){
        var select = [];
        var rawCards = this.rawHandCard[pos];
        var tIndex = Majiang.tIndex(cardIndex);
        for(var cIndex in rawCards){
            if(tIndex == Majiang.tIndex(cIndex)){
                select.push(cIndex);
            }
            if(select.length == num) return select;
        }
        return select;
    }

    getRandomHitCard(pos){
        let touchCard = this.handCards[pos][34];
        return touchCard;
        //var handCards =Object.keys(this.rawHandCard[pos]);
        /*var random = UnitTools.random(0,handCards.length-1);
        return handCards[random];*/
        //return handCards[handCards.length-1];
    }

    touchCard(pos){//摸一张牌
        this.touchPos = pos;
        var touchCardIndex = this.washCards[this.touchIndex];
        this.curTouchCardIndex = touchCardIndex;
        if(UnitTools.isNullOrUndefined(touchCardIndex)){
            //进入流局游戏结束
            this.Stam.changeToState('liuiju');
            console.log('流局了');
            return;
        }
        this.touchIndex+=1;
        this.manageCard(pos,touchCardIndex);
        this.handCards[pos][34] = touchCardIndex;
        var pId = this.tab.getPidWithPos(pos);
        this.sendGroupAndSave([pId],Message.touchCard,{pos:pos,cardIndex_s:touchCardIndex});
    }

    touchAndDealHandAction(pos){//摸牌并处理动作
        this.touchCard(pos);
        var action = this.getActionInHand(pos);
        var nums = Object.keys(action);
        var handAction = {};
        handAction[pos] = action;
        //跳转到动作等待
        nums!=0?this.toWaitAction(handAction,2):this.toHitCard(pos);

    }

    toHitCard(pos){//轮到谁出牌
        this.toHitPos = pos;
        this.action = new Action(++this.actionId);
        this.sendGroupAndSave([],Message.toHitCard,{pos:this.toHitPos,actionId:this.action.actionId});
        this.Stam.changeToState(3);
    }

    toWaitAction(actions,type){
        this.action = new Action(++this.actionId);
        this.action.type = type;
        this.action.setActionData(actions);
        for(var pos in actions){
            var action = actions[pos];
            this.action.addWaitPos(pos);
            var pId = this.tab.getPidWithPos(pos);
            this.sendSpecialAndSave(pId,Message.toWaitAction,{actionId:this.actionId,action:action});
        }
        this.Stam.changeToState(4,this.action)
    }

    getActionInHand(pos){//判定手中牌的动作，如暗杠，过路杠
        var action = {};
        var handShap = this.handCards[pos];
        console.log('当前摸得牌'+this.curTouchCardIndex);
        {//暗杠
            var details = [];
            for(var i =0;i<34;i++){
                if(handShap[i]==4){
                    var detail = {};
                    detail.pos = pos;
                    detail.tIndex = i;
                    detail.cardIndex = this.curTouchCardIndex;
                    details.push(detail);
                }
            }
            if(details.length!=0)action[Logic.HandAction.AnGang] = details;
        }

        {//过路杠
            var details = [];
            var actions = this.handActions[pos];
            for(var idx in actions){
                var one = actions[idx];
                if(one.actionType == Logic.HandAction.Peng){
                    var tIndex = one.tIndex;
                    var cardNum = handShap[tIndex];
                    if(cardNum===1){
                        var detail = {};
                        detail.pos = pos;
                        detail.tIndex = tIndex;
                        detail.cardIndex = this.curTouchCardIndex;
                        console.log('当前摸得牌'+this.curTouchCardIndex);
                        detail.actionType = Logic.HandAction.GuoluGang;
                        details.push(detail)//!!!!!!!s
                    }
                }
            }
            if(details.length != 0){
                action[Logic.HandAction.GuoluGang] = details;
            }
        }

        {//自摸
            var handCards = this.handCards[pos];
            var isHu = Rule.Majiang.hu(handCards);
            if(isHu){
                var detail = action[Logic.HandAction.Zimo] = {};
                detail.pos = pos;
                detail.tIndex = tIndex;
                detail.cardIndex = this.curTouchCardIndex;
                detail.actionType = Logic.HandAction.Zimo;
            }
        }
        return action;
    }

    getActionWithCard(pos,cardIndex){//判定别人打出的牌
        var action = {};

        var tIndex = Majiang.tIndex(cardIndex);
        var cardNum = this.handCards[pos][tIndex];
        {//碰
            if(cardNum==2){
                var detail = action[Logic.HandAction.Peng]={};
                detail.pos = pos;
                detail.tIndex = tIndex;
                detail.cardIndex = cardIndex;
                detail.hitPos = this.toHitPos;
                detail.actionType = Logic.HandAction.Peng;
            }
        }
        {//明杠
            if(cardNum==3){
                var detail = action[Logic.HandAction.MingGang]={};
                detail.pos = pos;
                detail.tIndex = tIndex;
                detail.cardIndex = cardIndex;
                detail.hitPos = this.toHitPos;
                detail.actionType = Logic.HandAction.MingGang;
            }
        }

        {//点炮
            if(!this.tab.custom.zimo){
                var handCards = this.handCards[pos];
                handCards[tIndex]+=1;
                var isHu = Rule.Majiang.hu(handCards);
                if(isHu){
                    var detail = action[Logic.HandAction.Dinapao] = {};
                    detail.pos = pos;
                    detail.tIndex = tIndex;
                    detail.cardIndex = cardIndex;
                    detail.dainPaoPos = this.toHitPos;
                    detail.actionType = Logic.HandAction.Dinapao;
                }
                handCards[tIndex]-=1;
            }
        }
        console.log("判定动作2");
        console.log(action);
        return action;
    }

    getAllActionWithCard(hitPos,cardIndex){
        var actions = {};
        this.tab.eachPos(function (pos) {
            if(pos == hitPos)return;
            var action = this.getActionWithCard(pos,cardIndex);
            var nums = Object.keys(action);
            if(nums!=0)actions[pos] = action;
        }.bind(this));
        console.log('判定动作1');
        console.log(actions);
        return actions;
    }

    handleAction(pos,actionType,selectCardIndex){
        var action = this.action.getActionData()[pos][actionType];
        if(actionType == Logic.HandAction.Peng){//处理碰
            var cardIndex  = action.cardIndex;//Majiang.cards[action.tIndex];
            var selects = this.selectCardIndexs(pos,cardIndex,2);
            for(var idx in selects){
                this.unmanageCard(pos,selects[idx]);
            }
            this.handActions[pos].push(action);
            this.sendGroupAndSave({},Message.doAction,{pos:pos,hitPos:action.hitPos,hitIndex:cardIndex,actionType:actionType,cardIndexs:selects});
            //console.log({pos:pos,hitPos:action.hitPos,hitIndex:cardIndex,actionType:actionType,cardIndexs:selects});
            //var nextPos = this.tab.getNextPos(action.hitPos);
            this.toHitCard(pos);
        }else if(actionType == Logic.HandAction.AnGang){//处理暗杠
            var selectAction = null;
            for(var idx in action){
                var one = action[idx];
                if(one.cardIndex == selectCardIndex){
                    selectAction = one;
                    break;
                }
            }
            var cardIndex  = selectAction.cardIndex;//Majiang.cards[selectAction.tIndex];
            var selects = this.selectCardIndexs(pos,cardIndex,4);
            for(var idx in selects){
                this.unmanageCard(pos,selects[idx]);
            }
            this.handActions[pos].push(selectAction);
            this.sendGroupAndSave({},Message.doAction,{pos:pos,cardIndex:cardIndex,actionType:actionType,cardIndexs:selects});
            this.touchAndDealHandAction(pos);
        }else if(actionType == Logic.HandAction.MingGang){//处理明杠
            var cardIndex  = action.cardIndex;//Majiang.cards[action.tIndex];
            var selects = this.selectCardIndexs(pos,cardIndex,3);
            for(var idx in selects){
                this.unmanageCard(pos,selects[idx]);
            }
            this.handActions[pos].push(action);
            this.sendGroupAndSave({},Message.doAction,{pos:pos,cardIndex:cardIndex,hitPos:action.hitPos,hitIndex:cardIndex,actionType:actionType,cardIndexs:selects});

            this.touchAndDealHandAction(pos);
        }else if(actionType == Logic.HandAction.GuoluGang){//处理过路杠
            var selectAction = null;
            for(var idx in action){
                var one = action[idx];
                if(one.cardIndex == selectCardIndex){
                    console.log('是否有值');
                    selectAction = one;
                    break;
                }
            }
            var cardIndex  = selectAction.cardIndex;//Majiang.cards[selectAction.tIndex];
            var selects = this.selectCardIndexs(pos,cardIndex,1);
            for(var idx in selects){
                this.unmanageCard(pos,selects[idx]);
            }
            this.handActions[pos].push(selectAction);
            this.sendGroupAndSave([],Message.doAction,{pos:pos,cardIndex:cardIndex,hitPos:selectAction.hitPos,actionType:actionType,cardIndexs:selects});
            this.touchAndDealHandAction(pos);
        }else if(actionType == Logic.HandAction.Pass){//过
            if(this.action.type == 1){//打出牌 过的情况
                this.touchAndDealHandAction(this.tab.getNextPos(this.toHitPos));
            }else{//自己摸牌过的情况
                this.toHitCard(this.toHitPos);
            }
        }
    }

    handleHu(isLiuju){//处理最后结果，包括流局
        var self = this;
        var sendData = {};//通知最后的数据,包括胡牌位置以及最后得分
        var posHuType = {};//不同位置的胡牌类型
        var score = {};
        var isZimo = false;//是否是自摸
        if(isLiuju){//处理流局

        }else{//有人胡了
            var waitPos = this.action.getWaitPoss();
            for(var idx in waitPos){
                var pos = waitPos[idx];
                var actionType = this.action.getRespond(pos).actionType;
                if(actionType == Logic.HandAction.Pass ||
                     (actionType!=Logic.HandAction.Dinapao &&
                         actionType!=Logic.HandAction.Zimo))continue;
                posHuType[pos] = actionType;
                if(actionType==Logic.HandAction.Zimo)isZimo=true;
            }
        }

        var huSpecial = {};
        for(var pos in posHuType){
            if(this.tab.custom.qingyise){
                var cards = this.rawHandCard[pos];
                var actionCards = this.handActions[pos];
                if(Rule.Majiang.isQingyise(cards,actionCards))huSpecial[pos].push(0);
            }
        }

        score = Score.score(posHuType,this.toHitPos,huSpecial);//++++++++++++++++++++++++++
        sendData.zhuangPos = this.mainPos;
        sendData.posHuType = posHuType;
        sendData.paoPos = isZimo?null:this.toHitPos;
        sendData.posName = this.tab.getNames();
        sendData.score = score;
        sendData.huCardIndex = isZimo?this.curTouchCardIndex:this.curHitCardIndex;
        sendData.posHandCards = this.rawHandCard;
        sendData.huSpecial = huSpecial;
        var posActionCards = {};
        for(var pos in this.handActions){
            var actionCards = this.handActions[pos];
            var posAction = posActionCards[pos] = {};
            for(var idx in actionCards){
                var action = actionCards[idx];
                posAction[action.actionType] = action;
            }
        }
        for(var pos in posActionCards){
            var posAction = posActionCards[pos];
            if(posAction[Logic.HandAction.GuoluGang]){
                delete posAction[Logic.HandAction.Peng];
            }
        }
        sendData.posActionCards = posActionCards;
        sendData.finished = false;
        this.juNum+=1;//局数增加1   
        for(var pos in score){
            var oneScore = score[pos];
            this.raceScores[pos].push(oneScore);//保存每个人每局分数
        }
        this.tab.custom.juNum=1;
        var isFinished = this.juNum == this.tab.custom.juNum;
        if(isFinished){
            var posNames = {};
            this.tab.eachPos(function (pos) {
                var info = posNames[pos] = {};
                var head = self.tab.getHead(pos);
                info.name = head.nickName;
                info.headUrl = head.headimgUrl;

            });
            sendData.finished = true;
            sendData.shareScore = {posScores:this.raceScores,posNames:posNames};
            //this.sendGroupAndSave([],Message.shareScore,{posScores:this.raceScores,posNames:posNames});
           
        }
        this.sendGroupAndSave([],Message.hu,sendData);
        this.clearToContinue();
        this.Stam.changeToState(5);//到准备阶段
        if(isFinished){
            //游戏结束，回收房间
            this.handler.recoverTab(this.tab.tableId);
        }
    }

    waitingP(){
        if(this.tab.room.getFreePos() == null){//sit full
            console.log('人满了，游戏开始');
            this.tab.room.setAllPosReady(false);
            this.Stam.changeToState(2);
        }
    }

    prpareP(){
        if(this.tab.room.isAllPosReady()){//所有玩家都准备了，游戏继续
            this.frames =[];
            this.tab.room.setAllPosReady(false);
            this.Stam.changeToState(2);
        }
    }

    washP(){
        console.log('进入洗牌阶段');
        this.washCards = Majiang.cards.concat();
        UnitTools.washArray(this.washCards);
        console.log('洗完后的牌:%o',this.washCards);

        for(var i = 0; i<48;i+=16){
            this.tab.eachPos(function (pos) {
                var startIndex = i+pos*4;
                var handStartIndex = i/4;
                for(var j=0;j<4;j++){
                    var cardIndex = this.washCards[startIndex+j];
                    this.manageCard(pos,cardIndex);
                }
            }.bind(this));
        }
        var startIndex = 48;
        this.tab.eachPos(function (pos) {
            var cardIndex = this.washCards[startIndex];
            this.manageCard(pos,cardIndex);
            startIndex+=1;
        }.bind(this));
        console.log('发到手里的牌:%o',this.rawHandCard);
        console.log('牌型:%o',this.handCards);

        this.tab.eachPos(function (pos) {
            var pId = this.tab.getPidWithPos(pos);
            var cards13 = Object.keys(this.rawHandCard[pos]);
            this.sendSpecialAndSave(pId,Message.startCards,{cardIndexs:cards13});
        }.bind(this));
        this.touchIndex = 54;
        this.mainPos = 3;
        //this.Stam.changeToState(3);
        this.touchAndDealHandAction(this.mainPos);
        /*this.touchCard(this.mainPos);
        this.toHitCard(this.mainPos);*/

    }
    washPTest(){
        console.log("进入配牌阶段！");
        this.washCards = [];

        var pos0 = [];
        var pos1 = [];
        var pos2 = [];
        var pos3 = [];

        {//碰
            /*this.washCards = [41,42,43,44];
            this.touchIndex = 0;
            this.mainPos = 2;
            pos0 = [11,12,13,14,15,16,17,18,19,45,42,43,44];
            pos1 = [61,62,63,64,65,66,67,68,69,95,92,93,94];
            pos2 = [111,112,113,114,115,116,117,118,119,145,142,143,144];
            pos3 = [161,162,163,164,165,166,167,168,169,91,141,193,194];
            
            for(var i = 0;i<13;i++){
                this.manageCard(0,pos0[i]);
                this.manageCard(1,pos1[i]);
                this.manageCard(2,pos2[i]);
                this.manageCard(3,pos3[i]);
            }
            this.tab.eachPos(function (pos) {
                var pId = this.tab.getPidWithPos(pos);
                var cards13 = Object.keys(this.rawHandCard[pos]);
                this.sendSpecialAndSave(pId,Message.startCards,{cardIndexs:cards13});
                if(pos == 3)console.log(cards13);
            }.bind(this))
            
            this.touchCard(this.mainPos);
            this.toHitCard(this.mainPos);*/
        }

        {//暗杠
            /*this.washCards = [41,42,43,44];
            this.touchIndex = 0;
            this.mainPos = 3;
            pos0 = [11,12,13,14,15,16,17,18,19,45,42,43,44];
            pos1 = [61,62,63,64,65,66,67,68,69,95,92,93,94];
            pos2 = [111,112,113,114,115,116,117,118,119,145,142,143,144];
            pos3 = [161,162,163,164,165,166,167,168,169,91,141,191,194];

            for(var i = 0;i<13;i++){
                this.manageCard(0,pos0[i]);
                this.manageCard(1,pos1[i]);
                this.manageCard(2,pos2[i]);
                this.manageCard(3,pos3[i]);
            }
            this.tab.eachPos(function (pos) {
                var pId = this.tab.getPidWithPos(pos);
                var cards13 = Object.keys(this.rawHandCard[pos]);
                this.sendSpecialAndSave(pId,Message.startCards,{cardIndexs:cards13});
                if(pos == 3)console.log(cards13);
            }.bind(this));
            this.touchAndDealHandAction(this.mainPos);*/
            //this.touchCard(this.mainPos);
            //this.toHitCard(this.mainPos);
        }

        {//明杠
            /*this.washCards = [41,42,43,44];
            this.touchIndex = 0;
            this.mainPos = 2;
            pos0 = [11,12,13,14,15,16,17,18,19,45,42,43,44];
            pos1 = [61,62,63,64,65,66,67,68,69,95,92,93,94];
            pos2 = [111,112,113,114,115,116,117,118,119,141,142,143,144];
            pos3 = [161,162,163,164,165,166,167,168,169,91,141,191,194];

            for(var i = 0;i<13;i++){
                this.manageCard(0,pos0[i]);
                this.manageCard(1,pos1[i]);
                this.manageCard(2,pos2[i]);
                this.manageCard(3,pos3[i]);
            }
            this.tab.eachPos(function (pos) {
                var pId = this.tab.getPidWithPos(pos);
                var cards13 = Object.keys(this.rawHandCard[pos]);
                this.sendSpecialAndSave(pId,Message.startCards,{cardIndexs:cards13});
                if(pos == 3)console.log(cards13);
            }.bind(this));
            this.touchCard(this.mainPos);
            this.toHitCard(this.mainPos);*/
        }

        {//过路杠
            //-------------------0   1  2  3
            /*this.washCards = [41,42,43,44,191];
            this.touchIndex = 0;
            this.mainPos = 2;
            pos0 = [11,12,13,14,15,16,17,18,19,45,42,43,44];
            pos1 = [61,62,63,64,65,66,67,68,69,95,92,93,94];
            pos2 = [111,112,113,114,115,116,117,118,119,145,142,143,144];
            pos3 = [161,162,163,164,165,166,167,168,169,91,141,192,194];

            for(var i = 0;i<13;i++){
                this.manageCard(0,pos0[i]);
                this.manageCard(1,pos1[i]);
                this.manageCard(2,pos2[i]);
                this.manageCard(3,pos3[i]);
            }

            this.tab.eachPos(function (pos) {
                var pId = this.tab.getPidWithPos(pos);
                var cards13 = Object.keys(this.rawHandCard[pos]);
                this.sendSpecialAndSave(pId,Message.startCards,{cardIndexs:cards13});
                if(pos == 3)console.log(cards13);
            }.bind(this));
            this.touchAndDealHandAction(this.mainPos);*/
        }
        {//胡牌点炮测试
            //-------------------0   1  2  3
            this.washCards = [41,42,43,44,191];
            this.touchIndex = 0;
            this.mainPos = 2;
            pos0 = [11,12,13,14,15,16,17,18,19,45,42,43,44];
            pos1 = [61,62,63,64,65,66,67,68,69,95,92,93,94];
            pos2 = [111,112,113,114,115,116,117,118,119,145,142,143,144];
            pos3 = [161,162,163,164,165,166,167,168,169,171,172,173,191];

            for(var i = 0;i<13;i++){
                this.manageCard(0,pos0[i]);
                this.manageCard(1,pos1[i]);
                this.manageCard(2,pos2[i]);
                this.manageCard(3,pos3[i]);
            }

            this.tab.eachPos(function (pos) {
                var pId = this.tab.getPidWithPos(pos);
                var cards13 = Object.keys(this.rawHandCard[pos]);
                this.sendSpecialAndSave(pId,Message.startCards,{cardIndexs:cards13});
                if(pos == 3)console.log(cards13);
            }.bind(this));
            this.touchAndDealHandAction(this.mainPos);
        }
        {//自摸测试
            //-------------------0   1  2  3
            /*this.washCards = [42,41,43,44,191];
            this.touchIndex = 0;
            this.mainPos = 2;
            pos0 = [11,12,13,14,15,16,17,18,19,45,42,43,44];
            pos1 = [61,62,63,64,65,66,67,68,69,95,92,93,94];
            pos2 = [111,112,113,114,115,116,117,118,119,145,142,143,144];
            pos3 = [161,162,163,164,165,166,167,168,169,172,173,174,191];

            for(var i = 0;i<13;i++){
                this.manageCard(0,pos0[i]);
                this.manageCard(1,pos1[i]);
                this.manageCard(2,pos2[i]);
                this.manageCard(3,pos3[i]);
            }

            this.tab.eachPos(function (pos) {
                var pId = this.tab.getPidWithPos(pos);
                var cards13 = Object.keys(this.rawHandCard[pos]);
                this.sendSpecialAndSave(pId,Message.startCards,{cardIndexs:cards13});
                if(pos == 3)console.log(cards13);
            }.bind(this));
            this.touchAndDealHandAction(this.mainPos);*/
        }
        {//碰 过路杠 胡
            /*this.washCards = [11,42,43,43,61,69];
            this.touchIndex = 0;
            this.mainPos = 2;
            pos0 = [21,12,13,14,15,16,17,18,19,45,42,43,44];
            pos1 = [71,62,63,64,65,66,67,68,69,95,92,93,94];
            pos2 = [121,112,113,114,115,116,117,118,119,145,142,143,144];
            pos3 = [161,111,163,164,165,166,167,168,169,31,32,33,191];

            for(var i = 0;i<13;i++){
                this.manageCard(0,pos0[i]);
                this.manageCard(1,pos1[i]);
                this.manageCard(2,pos2[i]);
                this.manageCard(3,pos3[i]);
            }

            this.tab.eachPos(function (pos) {
                var pId = this.tab.getPidWithPos(pos);
                var cards13 = Object.keys(this.rawHandCard[pos]);
                this.sendSpecialAndSave(pId,Message.startCards,{cardIndexs:cards13});
                if(pos == 3)console.log('第13张牌'+cards13);
            }.bind(this))
            this.touchAndDealHandAction(this.mainPos)
        }
        {//自摸清一色测试
            /*this.washCards = [42,41,43,44,64];
            this.touchIndex = 0;
            this.mainPos = 2;
            pos0 = [11,12,13,14,15,16,17,18,19,45,42,43,44];
            pos1 = [61,62,63,64,65,66,67,68,69,95,92,93,94];
            pos2 = [111,112,113,114,115,116,117,118,119,145,142,143,144];
            pos3 = [161,162,163,164,165,166,167,168,169,11,12,13,14];

            for(var i = 0;i<13;i++){
                this.manageCard(0,pos0[i]);
                this.manageCard(1,pos1[i]);
                this.manageCard(2,pos2[i]);
                this.manageCard(3,pos3[i]);
            }

            this.tab.eachPos(function (pos) {
                var pId = this.tab.getPidWithPos(pos);
                var cards13 = Object.keys(this.rawHandCard[pos]);
                this.sendSpecialAndSave(pId,Message.startCards,{cardIndexs:cards13});
                if(pos == 3)console.log(cards13);
            }.bind(this))
            this.touchAndDealHandAction(this.mainPos)*/
        }

    }
    hitP(){
        if(!this.action.isRespond(this.toHitPos)){
            /*var time = Date.now();
            if((time - this.action.actionTime)>this.hitTimeOut){
                var hitIndex = this.getRandomHitCard(this.toHitPos);
                this.action.setRespond(this.toHitPos,hitIndex);
            }*/
            return;
        }
        var cardIndex = this.action.getRespond(this.toHitPos);
        this.curHitCardIndex = cardIndex;
        this.unmanageCard(this.toHitPos,cardIndex);

        this.sendGroupAndSave([],Message.hitCard,{pos:this.toHitPos,cardIndex:cardIndex});

        //判断其他玩家基于这张牌是否有动作
        var handActions = this.getAllActionWithCard(this.toHitPos,cardIndex);
        if(Object.keys(handActions).length != 0){
            console.log('1 waiting!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            this.toWaitAction(handActions,1);
            //handActions = JSON.parse(handActions);
            console.log('xxx %o',handActions);
        }else{
            var nextPos = this.tab.getNextPos(this.toHitPos);
            this.touchAndDealHandAction(nextPos);
        }
        /*this.touchCard(nextPos);
        this.toHitCard(nextPos);*/
    }

    actionP(){
        var waitingPoss = this.action.getWaitPoss();
        for(var idx in waitingPoss){
            var pos = waitingPoss[idx];
            if(!this.action.isRespond(pos)){
                return;
            }
        }
        var hasHu = false;//有没有胡的动作
        
        for(var idx in waitingPoss){//找胡
            if(waitingPoss[idx]==null)continue;
            var resData = this.action.getRespond(waitingPoss[idx]);
            if(resData.actionType == Logic.HandAction.Dinapao || resData.actionType == Logic.HandAction.Zimo){
                hasHu = true;
                break;
            }
        }
        if(hasHu){
            //有人胡了，可能多人胡或一个人胡
            this.handleHu(false);
            return;
        }
        var finalActionPos = null;//最后谁处理了动作
        var finalAction = Logic.HandAction.Pass;//最后选择的动作
        var finalCardIndex = null;
        for(var idx in waitingPoss){//找碰杠过
            if(waitingPoss[idx]==null)continue;
            finalActionPos = waitingPoss[idx];
            var resData = this.action.getRespond(waitingPoss[idx]);
            finalCardIndex =resData.cardIndex;
            if(resData.actionType == Logic.HandAction.Peng || 
                resData.actionType == Logic.HandAction.AnGang||
                resData.actionType == Logic.HandAction.MingGang||
                resData.actionType == Logic.HandAction.GuoluGang){
                    //finalActionPos = waitingPoss[idx];
                    finalAction = resData.actionType;
                    break;
            }
        }
        this.handleAction(finalActionPos,finalAction,finalCardIndex);
        /*if(waitingPoss.length == 1){//只有一个人有动作（杠 碰）
            var realPos = waitingPoss[0];
            var resData = this.action.getRespond(realPos);
            if(resData.actionType!=Logic.HandAction.Dinapao && resData.actionType!=Logic.HandAction.Zimo){
                this.handleAction(realPos,resData.actionType,resData.cardIndex);
                console.log("jieguo:"+resData.cardIndex);
                return;
            }
        }*/
    }

    updata(){
        this.Stam.update();
    }
}

Logic.HandAction = {
    Pass:0,
    Peng:1,
    AnGang:2,
    GuoluGang:3,
    MingGang:4,
    Dinapao:5,
    Zimo:6
};

module.exports = Logic;