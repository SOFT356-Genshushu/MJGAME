"use strict";
cc._RF.push(module, '5f95e07P+lJ4YZQH/SC8mpv', 'GameLogic');
// resources/resources/scriptes/GameLogic.js

'use strict';

// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var CreatorHelper = require('CreatorHelper');
var UnitTools = require('UnitTools');
var User = require('Users');
var Handler = require('Handler');
var Majiang = require('Chess').Majiang;
var NetWorkManager = require('NetWorkManager');
var HandAction = {
    Peng: 1,
    AnGang: 2,
    GuoluGang: 3,
    MingGang: 4,
    Dinapao: 5,
    Zimo: 6
};
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        handCardsPfb: {
            default: [],
            type: cc.Prefab
        },
        hitCardsPfb: {
            default: [],
            type: cc.Prefab
        },
        gangpengPfb: {
            default: [],
            type: cc.Prefab
        },
        actionSelectPfb: cc.Prefab,
        actionImages: {
            default: [],
            type: cc.SpriteFrame
        },
        actionSplashPfb: cc.Prefab,
        splashImages: {
            default: [],
            type: cc.SpriteFrame
        },
        cardImages: cc.SpriteAtlas,
        gameScorePfb: cc.Prefab,
        scoreItemPfb: cc.Prefab,
        scorebqPfb: cc.Prefab, //标签Perfab
        cardhuPfb: cc.Prefab, //最后胡牌的标签
        titleMask: { //最后胡牌的表数据
            default: [],
            type: cc.SpriteFrame
        },
        finalScorePfb: cc.Prefab,
        finalScoreItemPfb: cc.Prefab,
        finScoreDetailPfb: cc.Prefab,
        waitingPfb: cc.Prefab
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function onLoad() {
        this.posCount = 4;
        this.selfPos = 2;
        this.headRoot = {};
        this.headSpUi = {};
        this.nameUi = {};
        this.scoreUi = {};
        this.raceScore = null; //服务器发送的最终数据
        for (var pos = 0; pos < this.posCount; pos++) {
            this.headRoot[pos] = cc.find('headwig' + pos + '/head', this.node);
            this.headSpUi[pos] = cc.find('headwig' + pos + '/head/headframe/head', this.node);
            this.nameUi[pos] = cc.find('headwig' + pos + '/head/name', this.node);
            this.scoreUi[pos] = cc.find('headwig' + pos + '/head/score', this.node);
        }

        this.handCardsUi = cc.find('handcards', this.node);
        this.hitCardUi = cc.find('hitcards', this.node);
        this.TrunTime = cc.find('turntime', this.node);
        this.selectActionUi = cc.find('actionselectui', this.node);
        this.gangpengCardsUi = cc.find('gangpengcards', this.node);
        this.gangpengCardsUiBottom = cc.find('gangpengcardsbottom', this.node);
        this.splashUi = cc.find('splashs', this.node);

        this.pInfos = {}; //保存玩家信息

        Handler.instance().logicCom = this;
        this.handCardsPos = this.createHandCardPos();
        this.hitCardsPos = this.createHitCardPos();
        this.gangpengCardsPos = this.createGangPengCardPos();
        this.splashPos = this.createSplashPos();
        this.isRestore = false; //是否是在短线重连中  

        this.selfHandCard = new Array(34);
        this.hitCards = {};
        for (var i = 0; i < 34; i++) {
            this.selfHandCard[i] = {};
        }

        this.handCards = new Array(this.posCount);

        this.clearToStart();

        this.onClose = function () {
            var bg = cc.instantiate(this.waitingPfb);
            this.node.addChild(bg);
            NetWorkManager.onConnectedToGame(function () {
                bg.removeFromParent(true);
            });
        };
        NetWorkManager.onClosedFromGame(this.onClose.bind(this));
    },
    clearToStart: function clearToStart() {
        for (var pos = 0; pos < this.posCount; pos++) {
            this.headRoot[pos].active = false;
            this.nameUi[pos].getComponent(cc.Label).string = '';
            this.scoreUi[pos].getComponent(cc.Label).string = '';
            this.hitCards[pos] = {};
            var cards = this.handCards[pos] = new Array(14);
            cards.fill(null);
        }
    },
    clearToContinue: function clearToContinue() {
        this.handCardsUi.removeAllChildren(true);
        this.handCardsUi.destroyAllChildren();
        this.hitCardUi.removeAllChildren(true);
        this.hitCardUi.destroyAllChildren();
        this.gangpengCardsUi.removeAllChildren(true);
        this.gangpengCardsUi.destroyAllChildren();
        this.selectActionUi.removeAllChildren(true);
        this.selectActionUi.destroyAllChildren();
        this.gangpengCardsUiBottom.removeAllChildren(true);
        this.gangpengCardsUiBottom.destroyAllChildren();

        this.TrunTime.active = false;

        this.selfHandCard = new Array(34);
        this.hitCards = {};
        for (var i = 0; i < 34; i++) {
            this.selfHandCard[i] = {};
        }
        this.handCards = new Array(this.posCount);
        for (var pos = 0; pos < this.posCount; pos++) {
            this.hitCards[pos] = {};
            var cards = this.handCards[pos] = new Array(14);
            cards.fill(null);
        }
    },
    createHandCardPos: function createHandCardPos() {
        //创建所有手里牌的位置
        var posArray = new Array(this.posCount);
        posArray[0] = { startPos: { x: 254, y: 208 }, offset: { x: -40, y: 0 }, lastOffset: { x: -20, y: 0 } };
        posArray[1] = { startPos: { x: -387, y: 263 }, offset: { x: 0, y: -29 }, lastOffset: { x: 0, y: -35 } };
        posArray[2] = { startPos: { x: -576, y: -347 }, offset: { x: 81.5, y: 0 }, lastOffset: { x: 20, y: 0 } };
        posArray[3] = { startPos: { x: 416, y: -191 }, offset: { x: 0, y: 29 }, lastOffset: { x: 0, y: 35 } };

        var handCardsPos = new Array(this.posCount);
        for (var pos = 0; pos < this.posCount; pos++) {
            var cardPos = new Array(14);
            handCardsPos[pos] = cardPos;
            for (var index = 0; index < 14; index++) {
                var position = cardPos[index] = {};
                var config = posArray[pos];
                position.x = config.startPos.x + index * config.offset.x;
                position.y = config.startPos.y + index * config.offset.y;
                if (index == 13) {
                    position.x += config.lastOffset.x;
                    position.y += config.lastOffset.y;
                }
            }
        }

        return handCardsPos;
    },
    createHitCardPos: function createHitCardPos() {
        //创建所有打出去的牌的位置
        var posArray = new Array(this.posCount);
        posArray[0] = { startPos: { x: 170, y: 70 }, offset: { x: -35, y: 0 }, lineOffset: { x: 0, y: 42 } };
        posArray[1] = { startPos: { x: -180, y: 150 }, offset: { x: 0, y: -29 }, lineOffset: { x: -47, y: 0 } };
        posArray[2] = { startPos: { x: -175, y: -80 }, offset: { x: 35, y: 0 }, lineOffset: { x: 0, y: -41 } };
        posArray[3] = { startPos: { x: 180, y: -150 }, offset: { x: 0, y: 29 }, lineOffset: { x: 47, y: 0 } };
        var hitCardsPos = new Array(this.posCount);

        for (var pos = 0; pos < this.posCount; pos++) {
            var cardPos = new Array(25);
            hitCardsPos[pos] = cardPos;
            for (var index = 0; index < 25; index++) {
                var position = cardPos[index] = {};
                var config = posArray[pos];
                var line = parseInt(index / 10);
                var lineIndex = index % 10;
                position.x = config.startPos.x + lineIndex * config.offset.x + config.lineOffset.x * line;
                position.y = config.startPos.y + lineIndex * config.offset.y + config.lineOffset.y * line;
            }
        }
        return hitCardsPos;
    },
    createGangPengCardPos: function createGangPengCardPos() {
        var posArray = new Array(this.posCount);
        posArray[0] = { startPos: { x: 294, y: 208 }, offset: { x: -130, y: 0 } };
        posArray[1] = { startPos: { x: -449, y: 253 }, offset: { x: 0, y: -98 } };
        posArray[2] = { startPos: { x: -576, y: -347 }, offset: { x: 200, y: 0 } };
        posArray[3] = { startPos: { x: 455, y: -193 }, offset: { x: 0, y: 98 } };
        var gangpengPos = {};
        for (var pos = 0; pos < this.posCount; pos++) {
            var positions = gangpengPos[pos] = [];
            for (var i = 0; i < 4; i++) {
                var position = {};
                position.x = posArray[pos].startPos.x + posArray[pos].offset.x * i;
                position.y = posArray[pos].startPos.y + posArray[pos].offset.y * i;
                positions.push(position);
            }
        }
        return gangpengPos;
    },
    createSplashPos: function createSplashPos() {
        var posArray = new Array(this.posCount);
        posArray[0] = { x: 0, y: 150 };
        posArray[1] = { x: -400, y: 0 };
        posArray[2] = { x: 0, y: -150 };
        posArray[3] = { x: 400, y: 0 };
        return posArray;
    },
    creatHandCardsUi: function creatHandCardsUi(pos, cardIndex) {
        var pfb = this.handCardsPfb[pos];
        var cardUi = cc.instantiate(pfb);
        if (pos == 2) {
            //修改自己的牌
            var sp = this.cardImages.getSpriteFrame(Majiang.smCard(cardIndex));
            cardUi.getComponent(cc.Sprite).spriteFrame = sp;
        }
        return cardUi;
    },
    createHitCardsUi: function createHitCardsUi(pos, cardIndex) {
        var preStr = ['h', 'l', 'h', 'r'];
        var pfb = this.hitCardsPfb[pos];
        var cardUi = cc.instantiate(pfb);
        var sp = this.cardImages.getSpriteFrame(preStr[pos] + Majiang.smCard(cardIndex));
        cardUi.getComponent(cc.Sprite).spriteFrame = sp;
        return cardUi;
    },
    createGangPengCardUi: function createGangPengCardUi(pos, cardIndex, type) {
        //1 碰  2杠
        var preStr = ['h', 'l', 'h', 'r'];
        var gangpengUi = cc.instantiate(this.gangpengPfb[pos]);
        var cards = gangpengUi.children;
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var sp = this.cardImages.getSpriteFrame(preStr[pos] + Majiang.smCard(cardIndex));
            card.getComponent(cc.Sprite).spriteFrame = sp;
        }
        type == 1 ? cards[3].active = false : cards[3].active = true;
        return gangpengUi;
    },
    addGangPengCardUi: function addGangPengCardUi(pos, cardIndex, type, index) {
        var count = 0;
        for (var idx in this.gangpengCardsUi.children) {
            var ui = this.gangpengCardsUi.children[idx];
            if (ui.meta.pos == pos) count += 1;
        }
        var gangpengUi = this.createGangPengCardUi(pos, cardIndex, type);
        gangpengUi.meta = {};
        gangpengUi.meta.tIndex = Majiang.tIndex(cardIndex);
        gangpengUi.meta.pos = pos;
        var position = this.gangpengCardsPos[pos][count];
        gangpengUi.x = position.x;
        gangpengUi.y = position.y;
        pos == 3 ? this.gangpengCardsUiBottom.addChild(gangpengUi) : this.gangpengCardsUi.addChild(gangpengUi);
    },
    addHitCardUi: function addHitCardUi(pos, cardIndex) {
        var cardUi = this.createHitCardsUi(pos, cardIndex);
        var index = Object.keys(this.hitCards[pos]).length;
        var position = this.hitCardsPos[pos][index];
        cardUi.x = position.x;
        cardUi.y = position.y;
        var zIndex = 0;
        if (pos == 0 || pos == 3) {
            zIndex = 25 - index;
        }
        if (pos == 1 || pos == 2) {
            zIndex = index;
        }
        cardUi.zIndex = zIndex;
        this.hitCardUi.addChild(cardUi);
        this.hitCards[pos][cardIndex] = { ui: cardUi, cardIndex: cardIndex };
    },
    addSplashUi: function addSplashUi(pos, type) {
        if (this.isRestore) return;
        var map = { 1: 0, 2: 1, 3: 1, 4: 1, 5: 2, 6: 2 };
        var splashUi = cc.instantiate(this.actionSplashPfb);
        splashUi.getComponent(cc.Sprite).spriteFrame = this.splashImages[map[type]];
        var position = this.splashPos[pos];
        splashUi.x = position.x;
        splashUi.y = position.y;
        this.splashUi.addChild(splashUi);
        splashUi.getComponent(cc.Animation).on('finished', function () {
            splashUi.removeFromParent(true);
        });
    },
    getScreenPos: function getScreenPos(selfLogicPos, logicPos) {
        var myPos = selfLogicPos;
        var delta = new Number(myPos) - 2;
        var screenPos = new Number(logicPos) - delta;
        screenPos = screenPos < 0 ? 4 + screenPos : screenPos;
        screenPos = screenPos >= 4 ? screenPos - 4 : screenPos;
        return screenPos;
    },
    showHead: function showHead(pId, scrPos, imgUrl, name) {
        this.headRoot[scrPos].active = true;
        var sp = this.headSpUi[scrPos].getComponent(cc.Sprite);
        var nameLab = this.nameUi[scrPos].getComponent(cc.Label);
        /*var frame = new cc.SpriteFrame();
        frame.setTexture(imgUrl);
        sp.spriteFrame = frame;*/
        CreatorHelper.changeSpriteFrameWithServerUrl(sp, imgUrl);
        nameLab.string = name;
        var info = UnitTools.getOrCreateJsonInJson(pId, this.pInfos);
        info.pos = scrPos;
    },
    hideHead: function hideHead(pId) {
        var info = this.pInfos[pId];
        if (UnitTools.isNullOrUndefined(info)) return;
        var pos = info.pos;
        this.headRoot[pos].active = false;
        this.nameUi[pos].getComponent(cc.Label).string = '';
        this.scoreUi[pos].getComponent(cc.Label).string = '';
    },
    adjustSelfHandCard: function adjustSelfHandCard() {
        var cardCount = 0;
        for (var i = 33; i >= 0; i--) {
            var cards = this.selfHandCard[i];
            for (var cardIndex in cards) {
                cardIndex = parseInt(cardIndex);
                var ui = cards[cardIndex].ui;
                var index = 12 - cardCount;
                cardCount += 1;
                var pos = this.handCardsPos[2][index];
                ui.x = pos.x;
                ui.y = pos.y;
            }
        }
    },
    adjustHandCard: function adjustHandCard(pos) {
        if (this.handCards[pos][13] != null) {
            var card = this.handCards[pos][13];
            for (var idx in this.handCards[pos]) {
                if (this.handCards[pos][idx] == null) {
                    this.handCards[pos][idx] = card;
                    this.handCards[pos][13] = null;
                    break;
                }
            }
        }
        var handCards = this.handCards[pos];
        var startIndex = 12;
        for (var idx in handCards) {
            var card = handCards[idx];
            if (card == null) continue;
            var position = this.handCardsPos[pos][startIndex];
            card.ui.x = position.x;
            card.ui.y = position.y;
            card.ui.zIndex = pos == 3 ? 12 - startIndex : startIndex;
            startIndex -= 1;
        }
    },
    touchCard: function touchCard(scrpos, cardIndex, type) {
        var cardUi = this.creatHandCardsUi(scrpos, cardIndex);
        var pos = this.handCardsPos[scrpos][13];
        cardUi.x = pos.x;cardUi.y = pos.y;
        this.handCardsUi.addChild(cardUi);
        var handCars = this.handCards[scrpos];
        handCars[13] = { cardIndex: cardIndex, ui: cardUi };
        if (type == 1) {
            var tIndex = Majiang.tIndex(cardIndex);
            cc.log(tIndex);
            cc.log(cardIndex);
            this.selfHandCard[tIndex][cardIndex] = { ui: cardUi };
            this.bindCardEvt(cardIndex, cardUi);
        }
    },
    removeHandCardAndAdjust: function removeHandCardAndAdjust(pos, cardIndexs) {
        //删除手里的牌并整理
        var type = pos == 2 ? 1 : 2;
        for (var idx in cardIndexs) {
            var cardIndex = cardIndexs[idx];
            if (type == 1) {
                var tIndex = Majiang.tIndex(cardIndex);
                var ui = this.selfHandCard[tIndex][cardIndex].ui;
                ui.removeFromParent(true);
                delete this.selfHandCard[tIndex][cardIndex];
            } else if (type == 2) {
                var handCards = this.handCards[pos];
                for (var idx in handCards) {
                    var card = handCards[idx];
                    if (card == null) continue;
                    card.ui.removeFromParent(true);
                    handCards[idx] = null;
                    break;
                }
            }
        }
        type == 1 ? this.adjustSelfHandCard() : this.adjustHandCard(pos);
    },
    turn: function turn(srcPos) {
        var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 20;

        if (this.timeSche) this.unschedule(this.timeSche);
        //point
        var rotations = [180, 90, 0, -90];
        this.TrunTime.active = true;
        this.TrunTime.getChildByName('point').rotation = rotations[srcPos];
        //timeout
        this.TrunTime.getChildByName('text').getComponent(cc.Label).string = time;
        this.timeSche = function () {
            time -= 1;
            this.TrunTime.getChildByName('text').getComponent(cc.Label).string = time;
        }.bind(this);
        this.schedule(this.timeSche, 1, 19, 0);
    },
    hitCard: function hitCard(scrPos, cardIndex, type) {
        this.addHitCardUi(scrPos, cardIndex);
        if (type == 1) {
            var tIndex = Majiang.tIndex(cardIndex);
            var ui = this.selfHandCard[tIndex][cardIndex].ui;
            ui.removeFromParent(true);
            delete this.selfHandCard[tIndex][cardIndex];
            this.adjustSelfHandCard();
        } else if (type == 2) {
            var handCards = this.handCards[scrPos];
            for (var idx in handCards) {
                var card = handCards[idx];
                if (card == null) continue;
                card.ui.removeFromParent(true);
                handCards[idx] = null;
                break;
            }
            this.adjustHandCard(scrPos);
        }
    },
    bindCardEvt: function bindCardEvt(cardIndex, cardUi) {
        var self = this;
        cardUi.cardIndex = cardIndex;
        cardUi.popUp = false;
        CreatorHelper.setNodeClickEvent(cardUi, function () {
            if (cardUi.popUp == true) {
                //出牌
                cc.log('出牌:' + cardIndex);
                NetWorkManager.onConnectedToGame(function (client) {
                    var data = {};
                    data.cardIndex = cardIndex;
                    data.actionId = self.actionId;
                    client.proxy.hitCard(data, function (data) {
                        cc.log(data);
                    });
                });
            } else {
                //自己弹起其他牌下去

                for (var tIndex in this.selfHandCard) {
                    var cards = this.selfHandCard[tIndex];
                    for (var cIdx in cards) {
                        var ui = cards[cIdx].ui;
                        if (!ui.popUp) continue;
                        ui.y -= 40;
                        ui.popUp = false;
                    }
                }
                cardUi.y += 40;
                cardUi.popUp = true;
            }
        }.bind(this));
    },
    showActionSelectUi: function showActionSelectUi(actions) {
        var self = this;
        var selectAction = function selectAction(actionType, cardIndex) {
            NetWorkManager.onConnectedToGame(function (client) {
                var data = {};
                data.actionType = actionType;
                data.cardIndex = cardIndex;
                data.actionId = self.actionId;
                client.proxy.selectAction(data, function (data) {
                    cc.log('选择结果');
                    cc.log(data);
                    self.selectActionUi.removeAllChildren(true);
                });
            });
        };
        this.selectActionUi.active = true;
        this.selectActionUi.removeAllChildren(true);
        var map = { 1: 1, 2: 2, 3: 2, 4: 2, 5: 3, 6: 3 };
        //添加"过"
        var passUi = cc.instantiate(this.actionSelectPfb);
        passUi.getComponent(cc.Sprite).spriteFrame = this.actionImages[0];
        passUi.getChildByName('card').active = false;
        this.selectActionUi.addChild(passUi);
        CreatorHelper.setNodeClickEvent(passUi, function () {
            cc.log('Pass选择了Action:');
            cc.log('Pass actionType:' + 0);
            cc.log('Pass tIndex:' + 0);
            selectAction(0, 0);
        });

        //-//
        for (var actionType in actions) {
            var action = actions[actionType];
            var details = [];
            if (!(action instanceof Array)) {
                details.push(action);
            } else {
                details = action;
            }
            for (var idx in details) {
                var detail = details[idx];
                var cardIndex = detail.cardIndex;
                var selectUi = cc.instantiate(this.actionSelectPfb);
                //修改图标，麻将
                selectUi.getComponent(cc.Sprite).spriteFrame = this.actionImages[map[actionType]];
                selectUi.getChildByName('card').getComponent(cc.Sprite).spriteFrame = this.cardImages.getSpriteFrame(Majiang.smCard(cardIndex));
                this.selectActionUi.addChild(selectUi);
                CreatorHelper.setNodeClickEvent(selectUi, function (actionType, cardIndex) {
                    cc.log('选择了Action:');
                    cc.log('actionType:' + actionType);
                    cc.log('cardIndexxxxxxx:' + this.cardImages.getSpriteFrame(Majiang.smCard(cardIndex)));
                    selectAction(actionType, cardIndex);
                }.bind(this, actionType, cardIndex));
            }
        }
    },
    handledoAction: function handledoAction(data) {
        this.selectActionUi.active = false;
        var actionType = data.actionType;
        var pos = data.pos;
        var hitPos = data.hitPos;
        var cardIndex = data.hitIndex;
        var cardIndexs = data.cardIndexs;
        var srcPos = this.getScreenPos(User.pos, pos); //屏幕位置
        var hitScrPos = this.getScreenPos(User.pos, hitPos); //打牌人的屏幕位置
        if (actionType == HandAction.Peng) {
            //处理碰
            this.addSplashUi(srcPos, actionType);
            var hitUi = this.hitCards[hitScrPos][cardIndex].ui;
            hitUi.removeFromParent(true);
            delete this.hitCards[hitScrPos][cardIndex];
            this.removeHandCardAndAdjust(srcPos, cardIndexs);
            this.addGangPengCardUi(srcPos, cardIndex, actionType, this.gangpengCardsUi.children.length);
        } else if (actionType == HandAction.AnGang) {
            //处理暗杠
            var cardIndex = data.cardIndex;
            this.addSplashUi(srcPos, actionType);
            this.removeHandCardAndAdjust(srcPos, cardIndexs);
            this.addGangPengCardUi(srcPos, cardIndex, actionType, this.gangpengCardsUi.children.length);
        } else if (actionType == HandAction.MingGang) {
            //处理明杠
            this.addSplashUi(srcPos, actionType);
            var hitUi = this.hitCards[hitScrPos][cardIndex].ui;
            hitUi.removeFromParent(true);
            delete this.hitCards[hitScrPos][cardIndex];
            this.removeHandCardAndAdjust(srcPos, cardIndexs);
            this.addGangPengCardUi(srcPos, cardIndex, actionType, this.gangpengCardsUi.children.length);
        } else if (actionType == HandAction.GuoluGang) {
            var cardIndex = data.cardIndex;
            var uis = this.gangpengCardsUi.children;
            this.addSplashUi(srcPos, actionType);
            this.removeHandCardAndAdjust(srcPos, cardIndexs);
            for (var idx in uis) {
                var ui = uis[idx];
                if (ui.meta.tIndex == Majiang.tIndex(cardIndex)) {
                    ui.children[3].active = true;
                    break;
                }
            }
        }
    },
    handlehu: function handlehu(data) {
        this.selectActionUi.removeAllChildren(true);
        this.selectActionUi.destroyAllChildren();
        var posHuType = data.posHuType;
        for (var pos in posHuType) {
            var srcPos = this.getScreenPos(User.pos, pos); //屏幕位置
            var actionType = posHuType[pos];
            this.addSplashUi(srcPos, actionType); //显示出胡牌 
        }
        this.scheduleOnce(function () {
            this.showGameScore(data.zhuangPos, data.posHuType, data.paoPos, data.score, data.posName, data.huCardIndex, data.posHandCards, data.posActionCards);
        }.bind(this), 2);
    },
    showGameScore: function showGameScore(zhuangPos, huPosAndType, paoPos, posScore, posNames, huCardIndex, posHandCards, posActionCards) {
        var self = this;
        var addStyle = function (styleRoot, styleName) {
            var biaoqianNode = cc.instantiate(this.scorebqPfb);
            styleRoot.addChild(biaoqianNode);
            var nameNode = cc.find("name", biaoqianNode);
            nameNode.getComponent(cc.Label).string = styleName;
        }.bind(this);

        var scoreUi = cc.instantiate(this.gameScorePfb);
        this.node.addChild(scoreUi);
        var titleNode = cc.find('title', scoreUi);
        if (Object.keys(huPosAndType).length == 0) {
            //流局
            titleNode.getComponent(cc.Sprite).spriteFrame = this.titleMask[0];
        } else if (posScore[User.pos] > 0) {
            titleNode.getComponent(cc.Sprite).spriteFrame = this.titleMask[1];
        } else if (posScore[User.pos] <= 0) {
            titleNode.getComponent(cc.Sprite).spriteFrame = this.titleMask[2];
        }
        var scoreItemsNode = cc.find('scoreitems', scoreUi);
        scoreItemsNode.removeAllChildren(true);
        scoreItemsNode.destroyAllChildren();

        for (var pos = 0; pos < this.posCount; pos++) {
            var scrPos = this.getScreenPos(User.pos, pos);
            var scoreItem = cc.instantiate(this.scoreItemPfb);
            scoreItemsNode.addChild(scoreItem);
            var zhuangNode = cc.find('zhuang', scoreItem);
            zhuangNode.active = false;

            if (pos == zhuangPos) zhuangNode.active = true; //显示庄

            var nameNode = cc.find('name', scoreItem);
            nameNode.getComponent(cc.Label).string = posNames[pos]; //显示名字
            var scoreNode = cc.find('score', scoreItem);
            scoreNode.getComponent(cc.Label).string = posScore[pos]; //显示分数
            var huMaskNode = cc.find('humask', scoreItem);
            huMaskNode.active = false;
            var styleNode = cc.find('style', scoreItem);
            styleNode.destroyAllChildren();
            var huType = huPosAndType[pos];

            if (!UnitTools.isNullOrUndefined(huType)) {
                //显示胡标签
                var styleName = huType == 5 ? '接炮' : '自摸';
                addStyle(styleNode, styleName);
                huMaskNode.active = true;
            } else if (paoPos != null && paoPos == pos) addStyle(styleNode, '点炮');

            var actionTimes = {};
            var addActionTime = function addActionTime(pos, actionType) {
                if (UnitTools.isNullOrUndefined(actionTimes[pos])) actionTimes[pos] = {};
                if (UnitTools.isNullOrUndefined(actionTimes[pos][actionType])) actionTimes[pos][actionType] = 0;
                actionTimes[pos][actionType] += 1;
            };

            var actionCards = posActionCards[pos];
            var handCards = posHandCards[pos];
            var cardStartX = 0; //结算页面牌的起始位置*
            var cardOffset = 55; //普通牌的偏移量*
            var pengOffset = 185; //碰牌的偏移量*
            var gangOffset = 225; //杠牌的偏移量*
            var huCardOffset = 20; //最后胡的牌的偏移量*

            var mjrootNode = cc.find('mjroot', scoreItem);
            mjrootNode.destroyAllChildren();

            for (var idx in actionCards) {
                var acards = actionCards[idx];
                var actionType = idx;
                var cardIndex = Majiang.cards[acards.tIndex];
                var hitPos = acards.hitPos;

                if (actionType == HandAction.Peng) {
                    //显示碰
                    for (var count = 0; count < 3; count++) {
                        var cardUi = this.createHitCardsUi(2, cardIndex);
                        cardUi.x = -12;
                        cardUi.y = 60;
                        cardUi.scale = 1;
                        mjrootNode.addChild(cardUi);
                        cardUi.x += cardStartX + cardOffset * count;
                    }
                    cardStartX += pengOffset;
                } else if (actionType == HandAction.AnGang) {
                    //显示杠
                    for (var count = 0; count < 4; count++) {
                        var cardUi = this.createHitCardsUi(2, cardIndex);
                        cardUi.x = -12;
                        cardUi.y = 60;
                        cardUi.scale = 1;
                        mjrootNode.addChild(cardUi);
                        cardUi.x += cardStartX + cardOffset * count;
                    }
                    addActionTime(pos, HandAction.AnGang);
                    cardStartX += gangOffset;
                } else if (actionType == HandAction.MingGang) {
                    for (var count = 0; count < 4; count++) {
                        var cardUi = this.createHitCardsUi(2, cardIndex);
                        cardUi.x = -12;
                        cardUi.y = 60;
                        cardUi.scale = 1;
                        mjrootNode.addChild(cardUi);
                        cardUi.x += cardStartX + cardOffset * count;
                    }
                    addActionTime(hitPos, HandAction.MingGang);
                    addActionTime(pos, HandAction.MingGang);
                    cardStartX += gangOffset;
                } else if (actionType == HandAction.GuoluGang) {
                    for (var count = 0; count < 4; count++) {
                        var cardUi = this.createHitCardsUi(2, cardIndex);
                        cardUi.x = -12;
                        cardUi.y = 60;
                        cardUi.scale = 1;
                        mjrootNode.addChild(cardUi);
                        cardUi.x += cardStartX + cardOffset * count;
                    }
                    addActionTime(hitPos, 0);
                    addActionTime(pos, HandAction.GuoluGang);
                    cardStartX += gangOffset;
                }
            }

            var count = 0;
            delete handCards[huCardIndex];

            for (var cardIndex in handCards) {
                //显示手牌
                var cardUi = this.createHitCardsUi(2, cardIndex);
                cardUi.x = -12;
                cardUi.y = 60;
                cardUi.scale = 1;
                mjrootNode.addChild(cardUi);
                cardUi.x += cardStartX;
                cardStartX += cardOffset;
                count += 1;
            }

            if (!UnitTools.isNullOrUndefined(huType)) {
                //自己胡了
                var cardUi = this.createHitCardsUi(2, huCardIndex);
                cardUi.x = -12;
                cardUi.y = 60;
                cardUi.scale = 1;
                mjrootNode.addChild(cardUi);
                cardUi.x += cardStartX + huCardOffset;
                var hbqUi = cc.instantiate(this.cardhuPfb);
                mjrootNode.addChild(hbqUi);
                hbqUi.x += cardStartX + huCardOffset;
            }
        }
        for (var pos = 0; pos < this.posCount; pos++) {
            var aTimeNode = cc.find('actiontimes', scoreItemsNode.children[pos]); //动作次数
            aTimeNode.getComponent(cc.Label).string = '';
            var aTimeName = { 0: '点杠', 2: '暗杠', 3: '明杠', 4: '过路杠' };
            var aTimes = actionTimes[pos];

            for (var aType in aTimes) {
                //动作次数
                var aTName = aTimeName[aType];
                var aTime = aTimes[aType];
                aTimeNode.getComponent(cc.Label).string += aTName + '×' + aTime + ' ';
            }
        }

        //添加点击继续时间
        var goonbn = scoreUi.getChildByName('goonbn');
        CreatorHelper.setNodeClickEvent(goonbn, function () {
            scoreUi.removeFromParent(true);
            //delete scoreUi;
            if (self.raceScore == null) {
                //继续游戏
                self.clearToContinue();
                NetWorkManager.onConnectedToGame(function (client) {
                    client.proxy.ready(true, function (data) {
                        cc.log(data);
                    });
                });
            } else {
                //结束了
                self.showFinalScore(self.raceScore.posScores, self.raceScore.posNames);
            }
        });
    },
    showFinalScore: function showFinalScore(posScores, posNameAndHeadUrl) {
        var finalScoreUi = cc.instantiate(this.finalScorePfb);
        this.node.addChild(finalScoreUi);
        var detailsUi = cc.find('details', finalScoreUi);
        detailsUi.removeAllChildren(true);
        detailsUi.destroyAllChildren();
        for (var pos in posScores) {
            var scores = posScores[pos];
            var name = posNameAndHeadUrl[pos].name;
            var headUrl = posNameAndHeadUrl[pos].headUrl;
            var scoreItemUi = cc.instantiate(this.finalScoreItemPfb);
            detailsUi.addChild(scoreItemUi);
            var headSp = cc.find('head', scoreItemUi).getComponent(cc.Sprite);
            CreatorHelper.changeSpriteFrameWithServerUrl(headSp, headUrl);
            var nameLab = cc.find('name', scoreItemUi).getComponent(cc.Label);
            nameLab.string = name;
            var allScore = 0;
            var scoresUi = cc.find('detailscroll/view/content', scoreItemUi);
            scoresUi.removeAllChildren(true);
            scoresUi.destroyAllChildren();

            for (var idx in scores) {
                var score = scores[idx];
                var scoreUi = cc.instantiate(this.finScoreDetailPfb);
                scoresUi.addChild(scoreUi);
                scoreUi.getComponent(cc.Label).string = parseInt(idx) + 1 + 'round: ' + score;
                allScore += score;
            }

            var finalScoreUi = cc.find('score', scoreItemUi);
            finalScoreUi.getComponent(cc.Label).string = allScore;
            User.score = allScore;
        }
    },
    showRoomId: function showRoomId(roomId) {
        var roomIdLab = cc.find('roomid', this.node).getComponent(cc.Label);
        roomIdLab.string = 'Room Number: ' + roomId;
    },
    normalStart: function normalStart() {
        var self = this;
        var inRoomInfo = User.loginToGameData.inRoomInfo;
        cc.log("gameLogic->normalStart->loginToGameData: %o", User.loginToGameData);
        var heads = inRoomInfo.heads;
        User.playerId = inRoomInfo.playerId;
        User.pos = inRoomInfo.pos;
        UnitTools.forEach(heads, function (pos, pInfo) {
            self.showHead(pInfo.playerId, self.getScreenPos(User.pos, pos), pInfo.headimgUrl, pInfo.nickName);
        });

        this.showRoomId(inRoomInfo.roomId);

        var frames = inRoomInfo.frames;
        for (var idx in frames) {
            this.isRestore = true; //表示当前处于短线重连中
            var frame = frames[idx];
            Handler.instance()['handle' + frame.eventName](frame.data);
        }
        this.isRestore = false;
    },
    start: function start() {
        this.normalStart();
        //cc.log('Player Info: ',this.pInfos);
        //cc.log('Player Info2 %o: ',User.account);
        //this.test();
    },
    test: function test() {
        //----------------------------头像测试
        this.showHead(2, 0, "http://i4.fuimg.com/583278/00e2ef22ec67b9b0.jpg", "鸡蛋");
        this.showHead(3, 1, "http://i4.fuimg.com/583278/00e2ef22ec67b9b0.jpg", "鸡蛋");
        this.showHead(4, 2, "http://i4.fuimg.com/583278/00e2ef22ec67b9b0.jpg", "鸡蛋");
        this.showHead(5, 3, "http://i4.fuimg.com/583278/00e2ef22ec67b9b0.jpg", "鸡蛋");
        //---------------------------牌测试
        for (var i = 0; i < 14; i++) {
            var cardIndex = Majiang.cards[i];
            var cardUi = this.creatHandCardsUi(2, cardIndex);
            var pos = this.handCardsPos[2][i];
            cardUi.x = pos.x;
            cardUi.y = pos.y;
            this.handCardsUi.addChild(cardUi);
            var tIndex = Majiang.tIndex(cardIndex);
            this.selfHandCard[tIndex]['' + cardIndex] = { ui: cardUi };
            this.bindCardEvt(cardIndex, cardUi);

            var cardUi = this.creatHandCardsUi(0, 19);
            var pos = this.handCardsPos[0][i];
            cardUi.x = pos.x;
            cardUi.y = pos.y;
            this.handCardsUi.addChild(cardUi);

            var cardUi = this.creatHandCardsUi(1, 19);
            var pos = this.handCardsPos[1][i];
            cardUi.x = pos.x;
            cardUi.y = pos.y;
            this.handCardsUi.addChild(cardUi);

            var cardUi = this.creatHandCardsUi(3, 19);
            var pos = this.handCardsPos[3][i];
            cardUi.x = pos.x;
            cardUi.y = pos.y;
            cardUi.zIndex = 14 - i;
            //this.node.zIndex = i;
            this.handCardsUi.addChild(cardUi);
        }
        //---------------------------出牌测试
        for (var i = 0; i < 25; i++) {
            var randomIndex = UnitTools.random(0, Majiang.cards.length - 1);
            var cardIndex = Majiang.cards[randomIndex];
            for (var pos = 0; pos < this.posCount; pos++) {
                this.addHitCardUi(pos, cardIndex);
            }
        }
        //---------------------------action选择测试
        var actions = {};
        actions[1] = { pos: 2, cardIndex: 61 };
        actions[2] = [{ pos: 2, cardIndex: 61 }, { pos: 2, cardIndex: 61 }];
        this.showActionSelectUi(actions);
        //-------------杠碰牌测试
        for (var pos = 0; pos < 4; pos++) {
            for (var i = 0; i < 4; i++) {
                var randomIndex = UnitTools.random(0, Majiang.cards.length - 1);
                var cardIndex = Majiang.cards[randomIndex];
                cc.log("randomIndex: " + randomIndex);
                this.addGangPengCardUi(pos, randomIndex, 2, i);
            }
        }
        //--------------splash test
        for (var pos = 0; pos < 4; pos++) {
            this.addSplashUi(pos, 1);
        }
        //---------------结算页面测试
        User.pos = 2;
        var zhuangPos = 2;
        var huPosAndType = { 2: 5 };
        var paoPos = 3;
        var posScores = { 0: 0, 1: 0, 2: 2, 3: -2 };
        var posName = { 0: "李鸡蛋0", 1: "李鸡蛋1", 2: "李鸡蛋2", 3: "李鸡蛋3" };
        var posHandCards = {
            0: { 11: 1, 12: 1, 13: 1, 14: 1, 15: 1, 16: 1, 17: 1, 18: 1, 19: 1 },
            1: { 11: 1, 12: 1, 13: 1, 14: 1, 15: 1, 16: 1, 17: 1, 18: 1 },
            2: { 11: 1, 12: 1, 13: 1, 14: 1, 15: 1, 16: 1, 17: 1, 18: 1, 19: 1, 21: 1, 22: 1, 23: 1 },
            3: { 11: 1, 12: 1, 13: 1, 14: 1, 15: 1, 16: 1, 17: 1, 18: 1 }
        };
        var posActionCards = {
            0: { 1: { tIndex: 17 } },
            1: { 3: { tIndex: 18, hitPos: 2 } },
            3: { 4: { tIndex: 19, hitPos: 1 } }
        };

        //this.showGameScore(zhuangPos,huPosAndType,paoPos,posScores,posName,41,posHandCards,posActionCards);
        //---------------最终分数显示---------------------
        var posScores = { 0: [0, 1, 2, 3, 4, 5, 6, 7, 8], 1: [0, 1, 2, 3, 4, 5, 6, 7, 8], 2: [0, 1, 2, 3, 4, 5, 6, 7, 8], 3: [0, 1, 2, 3, 4, 5, 6, 7, 8] };
        var posName = { 0: { name: "李鸡蛋0", headUrl: "http://i4.fuimg.com/583278/00e2ef22ec67b9b0.jpg" },
            1: { name: "李鸡蛋1", headUrl: "http://i4.fuimg.com/583278/00e2ef22ec67b9b0.jpg" },
            2: { name: "李鸡蛋2", headUrl: "http://i4.fuimg.com/583278/00e2ef22ec67b9b0.jpg" },
            3: { name: "李鸡蛋3", headUrl: "http://i4.fuimg.com/583278/00e2ef22ec67b9b0.jpg" } };
        //this.showFinalScore(posScores,posName);

        this.clearToContinue();
    },
    update: function update(dt) {
        for (var idx in Handler.instance().eventQueue) {
            var frame = Handler.instance().eventQueue[idx];
            Handler.instance()['handle' + frame.eventName](frame.data);
        }
        Handler.instance().eventQueue = [];
    },
    onDestroy: function onDestroy() {
        NetWorkManager.offClosedFromGame(this.onClose.bind(this));
        NetWorkManager.clearGameService();
    }
});

cc._RF.pop();