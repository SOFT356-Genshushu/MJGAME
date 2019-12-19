"use strict";
cc._RF.push(module, '109c1s6A0hDjq7nXmf4ydrJ', 'Handler');
// resources/resources/modules/Handler.js

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var User = require('Users');
var Majiang = require('Chess').Majiang;

var Handler = function () {
    function Handler() {
        _classCallCheck(this, Handler);

        this.logicCom = null; //游戏组件
        this.eventQueue = []; //消息队列
    }

    _createClass(Handler, [{
        key: 'handleinPos',
        value: function handleinPos(data) {
            var scrPos = this.logicCom.getScreenPos(User.pos, data.pos);
            this.logicCom.showHead(data.playerId, scrPos, data.headimgUrl, data.nickName);
        }
    }, {
        key: 'handlestartCards',
        value: function handlestartCards(data) {

            var cardIndexs = data.cardIndexs;
            for (var i = 0; i < 13; i++) {
                var cardIndex = cardIndexs[i];
                var cardUi = this.logicCom.creatHandCardsUi(2, cardIndex);
                var pos = this.logicCom.handCardsPos[2][i];
                cardUi.x = pos.x;
                cardUi.y = pos.y;
                this.logicCom.handCardsUi.addChild(cardUi);
                var tIndex = Majiang.tIndex(cardIndex);
                this.logicCom.selfHandCard[tIndex]['' + cardIndex] = { ui: cardUi };
                this.logicCom.bindCardEvt(cardIndex, cardUi);

                var cardUi = this.logicCom.creatHandCardsUi(0, cardIndex);
                var pos = this.logicCom.handCardsPos[0][i];
                cardUi.x = pos.x;
                cardUi.y = pos.y;
                this.logicCom.handCardsUi.addChild(cardUi);

                this.logicCom.handCards[0][i] = { ui: cardUi, cardIndex: cardIndex };

                var cardUi = this.logicCom.creatHandCardsUi(1, cardIndex);
                var pos = this.logicCom.handCardsPos[1][i];
                cardUi.x = pos.x;
                cardUi.y = pos.y;
                this.logicCom.handCardsUi.addChild(cardUi);
                this.logicCom.handCards[1][i] = { ui: cardUi, cardIndex: cardIndex };

                var cardUi = this.logicCom.creatHandCardsUi(3, cardIndex);
                var pos = this.logicCom.handCardsPos[3][i];
                cardUi.x = pos.x;
                cardUi.y = pos.y;
                cardUi.zIndex = 14 - i;
                //this.logicCom.node.zIndex = i;
                this.logicCom.handCardsUi.addChild(cardUi);
                this.logicCom.handCards[3][i] = { ui: cardUi, cardIndex: cardIndex };
            }
            this.logicCom.adjustSelfHandCard();
        }
    }, {
        key: 'handletouchCard',
        value: function handletouchCard(data) {
            var pos = data.pos;
            var cardIndex_s = data.cardIndex_s;
            var scrPos = this.logicCom.getScreenPos(User.pos, pos);
            var type = User.pos == pos ? 1 : 2;
            this.logicCom.turn(scrPos);
            this.logicCom.touchCard(scrPos, cardIndex_s, type);
            cc.log('触发touch');
        }
    }, {
        key: 'handletoHitCard',
        value: function handletoHitCard(data) {
            var pos = data.pos;
            var scrPos = this.logicCom.getScreenPos(User.pos, pos);
            this.logicCom.turn(scrPos);
            this.logicCom.actionId = data.actionId;
        }
    }, {
        key: 'handlehitCard',
        value: function handlehitCard(data) {
            var pos = data.pos;
            var cardIndex = data.cardIndex;
            var scrPos = this.logicCom.getScreenPos(User.pos, pos);
            var type = User.pos == pos ? 1 : 2;
            this.logicCom.hitCard(scrPos, cardIndex, type);
        }
    }, {
        key: 'handletoWaitAction',
        value: function handletoWaitAction(data) {
            this.logicCom.actionId = data.actionId;
            this.logicCom.showActionSelectUi(data.action);
        }
    }, {
        key: 'handledoAction',
        value: function handledoAction(data) {
            this.logicCom.handledoAction(data);
        }
    }, {
        key: 'handlehu',
        value: function handlehu(data) {
            if (data.finished) this.logicCom.raceScore = data.shareScore;
            this.logicCom.handlehu(data);
            cc.log('hu');
        }
    }, {
        key: 'handleshareScore',
        value: function handleshareScore(data) {
            //结算页面
            this.logicCom.showFinalScore(data.posScores, data.posNames);
        }
    }], [{
        key: 'instance',
        value: function instance() {
            if (Handler.g == null) Handler.g = new Handler();
            return Handler.g;
        }
    }]);

    return Handler;
}();

module.exports = Handler;
Handler.g = null;

Handler.service = {};
Handler.service.inPos = function (data, cb) {
    cc.log("收到服务器端信息：inPos");
    cc.log(data);
    Handler.instance().eventQueue.push({ eventName: 'inPos', data: data });
    //Handler.instance().handlerinPos(data);
};

Handler.service.startCards = function (data, cb) {
    cc.log('收到开牌消息: %o', data);
    Handler.instance().eventQueue.push({ eventName: 'startCards', data: data });
    //Handler.instance().handlestartCards(data);
};

Handler.service.touchCard = function (data, cb) {
    cc.log('收到摸牌消息: %o', data);
    Handler.instance().eventQueue.push({ eventName: 'touchCard', data: data });
    //Handler.instance().handlestartCards(data);
};

Handler.service.toHitCard = function (data, cb) {
    cc.log('收到轮到谁打牌的消息: %o', data);
    Handler.instance().eventQueue.push({ eventName: 'toHitCard', data: data });
    //Handler.instance().handlestartCards(data);
};

Handler.service.hitCard = function (data, cb) {
    cc.log('收到实际打下来牌的消息: %o', data);
    Handler.instance().eventQueue.push({ eventName: 'hitCard', data: data });
    //Handler.instance().handlestartCards(data);
};
Handler.service.toWaitAction = function (data, cb) {
    cc.log('收到等待玩家操作消息: %o', data);
    Handler.instance().eventQueue.push({ eventName: 'toWaitAction', data: data });
    //Handler.instance().handlestartCards(data);
};
Handler.service.doAction = function (data, cb) {
    cc.log('收到玩家选择动作消息: %o', data);
    Handler.instance().eventQueue.push({ eventName: 'doAction', data: data });
    //Handler.instance().handlestartCards(data);
};

Handler.service.hu = function (data, cb) {
    cc.log('收到胡牌消息: %o', data);
    Handler.instance().eventQueue.push({ eventName: 'hu', data: data });
    //Handler.instance().handlestartCards(data);
};

Handler.service.shareScore = function (data, cb) {
    cc.log('收到Share消息: %o', data);
    Handler.instance().eventQueue.push({ eventName: 'shareScore', data: data });
    //Handler.instance().handlestartCards(data);
};

cc._RF.pop();