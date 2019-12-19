var fs = require("fs");
var Rule = module.exports = {};
var Majiang = Rule.Majiang = {};
var Chess = require("./Chess.js");
Majiang.init = function () {//如果没有生成好的表，则创建表,如果有，直接读取文件
    console.log("查找胡牌表是否存在:");
    this.tabs = {};
    var tabs = [];
    this.path = __dirname + "/majiang_tabs/";
    for (var i = 0; i <= 8; i++) {
        var tab = {};
        tabs.push(tab);
        tab.key = 'table_' + i;
        tab.oo = false;
        tab.feng = false;
        tab.l = i;
        tab.tabExsit = fs.existsSync(this.path + tab.key);
        console.log("find %s...%s", tab.key, tab.tabExsit);

        var tab = {};
        tabs.push(tab);
        tab.key = 'table_oo_' + i;
        tab.oo = true;
        tab.feng = false;
        tab.l = i;
        tab.tabExsit = fs.existsSync(this.path + tab.key);
        console.log("find %s.   ..%s", tab.key, tab.tabExsit);

        var tab = {};
        tabs.push(tab);
        tab.key = 'table_feng_' + i;
        tab.oo = false;
        tab.feng = true;
        tab.l = i;
        tab.tabExsit = fs.existsSync(this.path + tab.key);
        console.log("find %s...%s", tab.key, tab.tabExsit);

        var tab = {};
        tabs.push(tab);
        tab.key = 'table_oo_feng_' + i;
        tab.oo = true;
        tab.feng = true;
        tab.l = i;
        tab.tabExsit = fs.existsSync(this.path + tab.key);
        console.log("find %s...%s", tab.key, tab.tabExsit);
    }
    for (var idx in tabs) {
        var tab = tabs[idx];
        if (tab.tabExsit) {
            this.loadTab(tab.key);
            continue;
        }
        this.gen_Tab_l(tab.key, tab.oo, tab.feng, tab.l);
    }
}

Majiang.gen_3 = function (keys, cards, level = 4) {
    if (level == 0)return;
    for (var idx in cards) {
        cards[idx] += 3;
        if (cards[idx] > 4) {
            cards[idx] -= 3;
            continue;
        }
        keys[this.searchKey(cards)] = 1;
        this.gen_3(keys, cards, level - 1);
        cards[idx] -= 3;
    }
}

Majiang.gen_3_oo = function (keys, cards, level = 4) {
    if (level == 0)return;
    for (var idx in cards) {
        cards[idx] += 2;
        if (cards[idx] > 4) {
            cards[idx] -= 2;
            continue
        }
        keys[this.searchKey(cards)] = 1;
        this.gen_3(keys, cards, level);
        cards[idx] -= 2;
    }
}

Majiang.gen_111 = function (keys, cards, level = 4) {
    if (level == 0)return;
    for (var i = 0; i < cards.length - 2; i++) {
        cards[i] += 1;
        cards[i + 1] += 1;
        cards[i + 2] += 1;
        if (cards[i] > 4 || cards[i + 1] > 4 || cards[i + 2] > 4) {
            cards[i] -= 1;
            cards[i + 1] -= 1;
            cards[i + 2] -= 1;
            continue;
        }
        keys[this.searchKey(cards)] = 1;
        this.gen_111(keys, cards, level - 1);
        cards[i] -= 1;
        cards[i + 1] -= 1;
        cards[i + 2] -= 1;
    }
}

Majiang.gen_111_3 = function (keys, cards, level = 5) {
    if (level == 0)return;
    for (var i = -1; i < cards.length; i++) {
        if (i != -1) {
            cards[i] += 3;
            if (cards[i] > 4) {
                cards[i] -= 3;
                continue;
            }
            keys[this.searchKey(cards)] = 1;
        }
        this.gen_111(keys, cards, level-1);
        this.gen_111_3(keys, cards, level-1);
        cards[i] -= 3;
    }
}

Majiang.gen_111_3_oo = function (keys, cards, level = 5) {
    if (level == 0)return;
    for (var idx in cards) {
        cards[idx] += 2;
        if (cards[idx] > 4) {
            cards[idx] -= 2;
            continue
        }
        keys[this.searchKey(cards)] = 1;
        this.gen_111_3(keys, cards, level);
        cards[idx] -= 2;
    }
}


Majiang.gen_Tab = function (tabKey) {
    var keys = {};
    var cards = new Array(9);
    cards.fill(0);
    this.gen_111_3(keys, cards, 5);
    this.writeTab(tabKey, keys);
}

Majiang.gen_Tab_oo = function (tabKey) {
    var keys = {};
    var cards = new Array(9);
    cards.fill(0);
    this.gen_111_3_oo(keys, cards, 5);
    this.writeTab(tabKey, keys);
}

Majiang.gen_Tab_Feng = function (tabKey) {
    var keys = {};
    var cards = new Array(7);
    cards.fill(0);
    this.gen_3(keys, cards, 4);
    this.writeTab(tabKey, keys);
}

Majiang.gen_Tab_Feng_oo = function (tabKey) {
    var keys = {};
    var cards = new Array(7);
    cards.fill(0);
    this.gen_3_oo(keys, cards, 4);
    this.writeTab(tabKey, keys);
}

Majiang.gen_l = function (key, keys) {//为一个key生成所有缺1的情况
    var num = parseInt(key);
    var delta = 0.1;
    for (var index = 0; index < key.length; index++) {
        delta = delta * 10;
        if (key[key.length - 1 - index] == 0)continue;
        keys[num - delta] = 1;
    }
}

Majiang.gen_Tab_l = function (key, oo, feng, l) {
    console.log("正在生成表:%s...", key);
    var tabBase = this.tabKey(oo, feng, 0);
    if (!Majiang.tabExsit(tabBase)) {//基础表不存在
        if (oo == false && feng == false) this.gen_Tab(tabBase);
        if (oo == true && feng == false) this.gen_Tab_oo(tabBase);
        if (oo == false && feng == true) this.gen_Tab_Feng(tabBase);
        if (oo == true && feng == true) this.gen_Tab_Feng_oo(tabBase);
        this.loadTab(tabBase);
    }
    if (l == 0) {
        console.log("表 %s 生成完毕;", key);
        return;
    }
    //生成带癞子的
    var tabKeys = this.tabs[this.tabKey(oo, feng, l - 1)];
    var keys = {};
    for (var searchKey in tabKeys) {
        this.gen_l(searchKey, keys);
    }
    this.writeTab(key, keys);
    this.loadTab(key);
    console.log("表 %s 生成完毕;", key);
}
Majiang.tabKey = function (oo, feng, l) {
    if (oo == false && feng == false) {
        return 'table_' + l;
    }
    if (oo == true && feng == false) {
        return 'table_oo_' + l;
    }
    if (oo == false && feng == true) {
        return 'table_feng_' + l;
    }
    if (oo == true && feng == true) {
        return 'table_oo_feng_' + l;
    }
}

Majiang.tabExsit = function (tabKey) {
    return fs.existsSync(this.path + tabKey);
}


Majiang.loadTab = function (tabKye) {
    var searchKey = this.tabs[tabKye] = {};
    var data = fs.readFileSync(this.path + tabKye).toString();
    var keys = data.split("\n");
    for (var idx in keys) {
        searchKey[keys[idx]] = 1;
    }
}

Majiang.searchKey = function (cards) {
    var key = 0;
    for (var i = 0; i < cards.length; i++) {
        key = key * 10 + cards[i];
    }
    return key;
}

Majiang.addSearch = function (tabKey, key) {
    this.tabs[tabKey][key] = 1;
}

Majiang.writeTab = function (tabKey, keys) {
    var path = this.path + tabKey;
    var data = "";
    var writeKeys = Object.keys(keys);
    for (var idx in writeKeys) {
        data += writeKeys[idx];
        if (idx == writeKeys.length - 1)break;
        data += "\n";
    }
    fs.writeFileSync(path, data);
}

Majiang.shap = function (type, cards) {
    var shap = 0;
    var startIndex = type * 9;
    var count = type == 3 ? 7 : 9;
    for (var i = 0; i < count; i++) {
        shap = shap * 10 + cards[startIndex + i];
    }
    return shap;
}

Majiang.oo = function (shapNum) {
    if (shapNum % 3 == 0)return false;
    return true;
}

Majiang.feng = function (cardType) {
    return cardType == 3;
}

Majiang.shapOf = function (type, shapCards) {
    var startIndex = type * 9;
    var endIndex = type == 3 ? startIndex + 7 : startIndex + 9;
    return shapCards.slice(startIndex, endIndex);
}

Majiang.shapNum = function (shap) {//某种牌型的个数
    var str = '' + shap;
    var num = 0;
    for (var idx in str) {
        num += parseInt(str[idx]);
    }
    return num;
}

Majiang.isShap = function (testShap, feng, l) {//0表示不是shap 1表示ooshap 2表示非ooshap
    var code = 0;
    var tabKey = this.tabKey(true, feng, l);
    if (this.tabs[tabKey][testShap] == 1) {
        return code = 1;
    }
    tabKey = this.tabKey(false, feng, l);
    if (this.tabs[tabKey][testShap] == 1) code = 2;
    return code;
}

Majiang.match = function (shap, oo, feng, l) {
    var tabKey = this.tabKey(oo, feng, l);
    if (this.tabs[tabKey][shap] == 1)return true;
    return false;
}


Majiang.needNum_l = function (oo, num, l) {
    var needNum = 0;
    var totalNum = 0;
    if (oo) {
        for (var i = 0; i < 4; i++) {
            totalNum = 2 + i * 3;//2+3*n
            needNum = totalNum - num;
            if (needNum >= 0 && needNum <= l)return needNum;
        }
    } else {
        for (var i = 0; i < 4; i++) {
            totalNum = i * 3;//3*n
            needNum = totalNum - num;
            if (needNum >= 0 && needNum <= l)return needNum;
        }
    }
    return -1;//-1表示无法组成
}

Majiang.hu = function (cards) {//判断是否胡牌
    var shaps = new Array(4);
    var huShap = new Array(2);//0位置是将的num 1位置是非将的num
    huShap.fill(0);
    for (var type = 0; type < 4; type++) {
        shaps[type] = this.shap(type, cards);
    }
    for (var i = 0; i < 4; i++) {
        if (shaps[i] == 0)continue;
        if (i == 3) {//分牌
            var code = this.isShap(shaps[i], true, 0);
            if (code == 0)return false;
            huShap[code - 1] += 1;
        } else {//非分牌
            var code = this.isShap(shaps[i], false, 0);
            if (code == 0)return false;
            huShap[code - 1] += 1;
        }
    }
    if (huShap[0] != 1)return false;
    return true;
}

Majiang.hu_l = function (cards, l) {//带癞子的胡
    if (l == 0)return this.hu(cards);
    var shaps = new Array(4);
    var handsNum = 0;
    for (var type = 0; type < 4; type++) {//获得所有牌的shap
        var sp = shaps[type] = {};
        sp.shap = this.shap(type, cards);
        sp.num = this.shapNum(sp.shap);
        handsNum += sp.num;
    }
    if (handsNum == 0)return true;//手里没有牌，都是癞子，直接胡
    var huStyle = [];
    for (var ooType = 0; ooType < 4; ooType++) {
        var style = {};
        var needNum = 0;
        var good = true;
        var ooSp = shaps[ooType];
        if (ooSp.num == 0)continue;
        for (var type in shaps) {
            var sp = shaps[type];
            if (sp.num == 0)continue;
            var detail = {};
            if (type == ooType) {
                detail.oo = true;
                detail.need_l = this.needNum_l(true, sp.num, l);
            } else {
                detail.oo = false;
                detail.need_l = this.needNum_l(false, sp.num, l);
            }
            needNum += detail.need_l;
            if (detail.need_l == -1 || needNum > l) {
                good = false;
                break;
            }
            style[type] = detail;
        }
        if (good) {
            var emptyStyle = Object.keys(style).length == 0 ? true : false;
            var leftNum = l - needNum;
            if (leftNum % 3 == 0 && !emptyStyle) huStyle.push(style);
        }
    }
    for (var idx in huStyle) {
        var style = huStyle[idx];
        var good = true;
        var totalNeed = 0;
        var badCount = 0;
        var badType = null;
        for (var type in style) {
            var detail = style[type];
            var feng = type == 3 ? true : false;
            var match = this.match(shaps[type].shap, detail.oo, feng, detail.need_l);
            if (!match) {
                good = false;
                badCount += 1;
                badType = type;
            }
            if (badCount == 2) {
                good = false;
            }

        }
        if (badCount == 1 && l - totalNeed == 3) {//所有的类型里面，加3，然后再测试一次
            var detail = style[badType];
            var feng = badType == 3 ? true : false;
            good = this.match(shaps[badType].shap, detail.oo, feng, 3);
        }
        if (good)return true;
    }
    return false;
}

Majiang.isQingyise = function (cards, actionCards) {
    var cardType = null;
    var qingyise = true;
    for (var cardIndex in cards) {
        if (cardType == null) {
            cardType = Chess.Majiang.card(cardIndex)[0];
        } else {
            if (cardType != Chess.Majiang.card(cardIndex)[0]) {
                qingyise = false;
                return qingyise;
            }
        }
    }
    for (var idx in actionCards) {
        if (cardType != Chess.Majiang.card(Chess.Majiang.cards(actionCards[idx].tIndex))[0]) {
            return false;
        }
    }
    return qingyise;
}

Majiang.init();

//---------------------------快速测试----------------------
var getHandShap = function (cards) {
    var handShap = new Array(34);
    handShap.fill(0);
    for (var idx in cards) {
        var cardIndex = cards[idx];
        var tIndex = Chess.Majiang.tIndex(cardIndex);
        handShap[tIndex] += 1;
    }
    return handShap;
}

// {//快速正确
//     var cards = [11,12,13,14,15,16,17,18,19,21,21];
//     var shap = getHandShap(cards);
//     var isHu = Majiang.hu(shap);
//     console.log(isHu == true);
// }
//
// {//快速错误
//     var cards = [11,12,13,14,15,16,17,17,19,21,21];
//     var shap = getHandShap(cards);
//     var isHu = Majiang.hu(shap);
//     console.log(isHu == false);
// }
//
// {//快速错误
//     var cards = [21,22];
//     var shap = getHandShap(cards);
//     var isHu = Majiang.hu(shap);
//     console.log(isHu == false);
// }
//
// {//快速带癞子正确
//     var cards = [11,12,13,14,15,16,17,18,19,21];
//     var shap = getHandShap(cards);
//     var isHu = Majiang.hu_l(shap,1);
//     console.log(isHu == true);
// }
//
// {//快速带癞子正确
//     var cards = [11,12,13,14,15,16,17,21,21,21];
//     var shap = getHandShap(cards);
//     var isHu = Majiang.hu_l(shap,1);
//     console.log(isHu == true);
// }

{//测试胡牌
    // var cards = [2, 2, 2, 3, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    //     var shap = cards
    // var isHu = Majiang.hu(shap);
    // console.log(isHu == true);
}










