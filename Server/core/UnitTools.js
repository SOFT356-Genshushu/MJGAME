/**
 * Created by litengfei on 16/6/13.
 */
var fs = require("fs");
var path = require('path');
var os = require('os');
var uuid = require('node-uuid');
var child_process = require('child_process');
function UnitTools()
{

}
UnitTools.isNullOrUndefined = function(value)
{
    if(typeof  value == "undefined")return true;
    if(value == null)return true;
    return false;
}
UnitTools.isUndefined = function(value)
{
    if(typeof  value == "undefined")return true;
    return false;
}
UnitTools.isFunction = function(value)
{
    if(typeof value != "function")return false;
    return true;
}
UnitTools.isJson = function(value)
{
    if(typeof  value != "object")return false;
    return true;
}
UnitTools.isArray = function(value)
{
    if(value instanceof Array)return true;
    return false;
}

UnitTools.isNumber = function (value) {
    return !isNaN(value)
}

UnitTools.getJsonKeys = function(json)
{
    if(UnitTools.isJson(json)==false)
    {
        throw new Error("getJsonKeys must be json");
    }
    var names = [];
    for(var key in json)
    {
        names.push(key);
    }
    return names;
}

UnitTools.getJsonValues = function(json){
    if(UnitTools.isJson(json)==false) {
        throw new Error("getJsonvalues must be json");
    }
    var values =[];
    for(var key in json){
        values.push(json[key]);
    }
    return values;
}

UnitTools.getJsonLength = function(json){
    if(UnitTools.isJson(json)==false) {
       return 0;
    }
    var index = 0;
    for(var key in json) {
       index+=1;
    }
    return index;
}

UnitTools.getJsonFirstKey = function(json){
    if(!UnitTools.isJson(json))return null;
    for(var key in json){
        return key;
    }
}

UnitTools.loadJson = function(filePath,callback)
{
    fs.readFile(filePath,function(err,data)
    {
        if(err)throw new Error("read file "+filePath+"错误"+" "+err.message);
        var readJson = JSON.parse(data);
        callback(readJson);
    });
}

UnitTools.loadJsonSync = function (filePath) {
    var data = fs.readFileSync(filePath);
    var readJson = JSON.parse(data);
    return readJson;
}

UnitTools.getFullPath = function(url){
    return path.normalize(__dirname+url);
}

UnitTools.loadDirJs = function(dir)//该方法，是相对于这个文件的位置
{
    var load = function(jsPath, name) {
        if (name) {
            return require(path.normalize(jsPath + name));
        }
        return require(path.normalize(jsPath));
    };
    var patcher = {};
    var fullPath = path.normalize(__dirname+dir);
    fs.readdirSync(fullPath).forEach(function (filename) {
        if (!/\.js$/.test(filename)) {
            return;
        }
        var name = path.basename(filename, '.js');
        var _load = load.bind(null, './' + dir + '/', name);
        patcher.__defineGetter__(name, _load);
    });
    return patcher;
}

UnitTools.loadDirFiles = function (dir) {
    var load = function(jsPath, name) {
        if (name) {
            return require(path.normalize(jsPath + name));
        }
        return require(path.normalize(jsPath));
    };
    var patcher = {};
    var fullPath = path.normalize(__dirname+dir);
    fs.readdirSync(fullPath).forEach(function (filename) {
        if (!/\.js$/.test(filename)) {
            return;
        }
        var name = path.basename(filename, '.js');
        patcher[name] = fullPath+"/"+filename;
    });
    return patcher;
}

UnitTools.getOrCreateArrayInJson = function(key,ob)
{
    if(UnitTools.isJson(ob) === false){return null};
    var value = ob[key];
    if(UnitTools.isArray(value) === false)
    {
        value = ob[key] = [];
    }
    return value;
}

UnitTools.getOrCreateJsonInJson = function(key,json){
    if(UnitTools.isNullOrUndefined(json[key])){
        return json[key] = {};
    }else {
        return json[key];
    }
}

UnitTools.hasKey = function(ob,key)
{
    if(UnitTools.isUndefined(ob[key]))return false;
    return true;
}

UnitTools.arrayHasValue = function(value,ar){
    if(!UnitTools.isArray(ar))return false;
    for(var key in ar){
        if(ar[key] == value)return true;
    }
    return false;
}

//第一个包含第二个
UnitTools.arrayHasArray = function (arr1,arr2) {
    for(var key in arr2){
        var one = arr2[key];
        if(!UnitTools.arrayHasValue(one,arr1)){
            return false;
        }
    }
    return true;
}

UnitTools.arrayHasValueNum = function (value,arr) {
    var count = 0;
    for(var key in arr){
        if(arr[key] == value){
            count+=1;
        }
    }
    return count;
}

UnitTools.getArrayValueIndex = function(arr,value){
    if(!UnitTools.isArray(arr))return -1;
    var findIndex = -1;
    for(var index in arr){
        var val = arr[index];
        if(value == val){
            findIndex = index;
            break;
        }
    }
    return findIndex;
}
UnitTools.remove = function(ob,key)
{
    delete ob[key];
}

UnitTools.removeArray = function(arr,removeArr){
    if(!UnitTools.isArray(arr)||!UnitTools.isArray(removeArr))return;
    UnitTools.forEach(removeArr,function(index,value){
        var findIndex = UnitTools.getArrayValueIndex(arr,value);
        if(findIndex!=-1)arr.splice(findIndex,1);
    });
}

//返回移除元素的数组
UnitTools.removeArrayAll = function (arr,removeArray) {
    if(!UnitTools.isArray(arr)||!UnitTools.isArray(removeArray))return;
    var newArray = [];
    UnitTools.forEach(arr,function (index,cardIndex) {
        if(UnitTools.arrayHasValue(cardIndex,removeArray))return;
        newArray.push(cardIndex);
    })
    return newArray;
}

UnitTools.isAllSameInArray = function (array) {
    if(UnitTools.isNullOrUndefined(array)) return false;
    if(!UnitTools.isArray(array))return false;
    if(array.length == 1)return true;

    var firstValue = array[0];
    for(var i = 1;i<array.length;i++){
        if(array[i] != firstValue)return false;
    }
    return true;
}

//添加组件
UnitTools.addComponent = function(owner,componetName,component)
{
    if(UnitTools.isNullOrUndefined(owner))
    {
        throw new Error("addComponent owner must be valid");
    }
    var components = owner.components;
    if(UnitTools.isNullOrUndefined(components))
    {
        owner.components = {};
    }
    components[componetName] = component;
}
//获得组件
UnitTools.getComponent = function(owner,componentName)
{
    if(UnitTools.isNullOrUndefined(owner.components))return null;
    return owner.components[componentName];
}

UnitTools.attachJson = function(orgin,attch){
    if(!(UnitTools.isJson(orgin) && UnitTools.isJson(attch)))return;
    UnitTools.forEach(attch,function(key,value){
        orgin[key] = value;
    });
}


UnitTools.forEach = function(data,itemCallback)
{
    for(var key in data)
    {
        try{
            itemCallback(key,data[key]);
        }catch(e){
            //throw  new Error(e);
            console.log(e.stack);
        }

    }
}



UnitTools.now = function()
{
    return new Date().getTime();
}

UnitTools.getFuncArgs = function(fn) {
    if(typeof fn !== 'object' && typeof fn !== 'function' ) return;
    const COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    const DEFAULT_PARAMS = /=[^,)]+/mg;
    const FAT_ARROWS = /=>.*$/mg;
    let code = fn.prototype ? fn.prototype.constructor.toString() : fn.toString();
    code = code
        .replace(COMMENTS, '')
        .replace(FAT_ARROWS, '')
        .replace(DEFAULT_PARAMS, '');
    let result = code.slice(code.indexOf('(') + 1, code.indexOf(')')).match(/([^\s,]+)/g);
    return result === null ? [] :result;
};
UnitTools.changeFunctionArgsToArray = function (arguments,fromIndex) {
    var args = Array.prototype.slice.apply(arguments);
    var args = args.slice(fromIndex);
    return args;
}

UnitTools.genID = function()
{
    return uuid.v1();
    //var id = "";
    //for(var i = 0;i<8;i++)
    //{
    //    id+=(((1+Math.random())*0x10000)|0).toString(16).substring(1);
    //}
    //return id.toLowerCase();

}

UnitTools.genShortID = function(){
    var id = "";
    for(var i = 0;i<6;i++){
        id+=UnitTools.random(0,9);
    }
    return id;
}

UnitTools.isTimeOut = function(from,timeOut)
{
    var delta = Date.now() - from;
    if(delta >=timeOut)return true;
}

UnitTools.formatStr = function(str)
{
    if( arguments.length == 0 )
        return null;
    var str = arguments[0];
    for(var i=1;i<arguments.length;i++) {
        var re = new RegExp('\\{' + (i-1) + '\\}','gm');
        str = str.replace(re, arguments[i]);
    }
    return str;
}
//String.prototype.format = function()
//{
//    var args = arguments;
//    return this.replace(/\{(\d+)\}/g,
//        function(m,i){
//            return args[i];
//        });
//}

UnitTools.getLocalIps = function(flagIpv6)
{
    var ifaces = os.networkInterfaces();
    var ips = [];
    var func = function(details) {
        if (!flagIpv6 && details.family === 'IPv6') {
            return;
        }
        ips.push(details.address);
    };
    for (var dev in ifaces) {
        ifaces[dev].forEach(func);
    }
    return ips;
}

UnitTools.isIpInLocal = function(ip) {
    var localIps = UnitTools.getLocalIps(false);
    var isInLocal = false;
    UnitTools.forEach(localIps,function(index,ipValue){
        if(ipValue == ip){
            isInLocal = true;
        }
    });
    return isInLocal;
}

UnitTools.random = function(minNum,maxNum)
{
    var length = maxNum - minNum;
    var random = Math.floor(Math.random()*(length+1));
    return minNum +random;
}

//获得当月的天数
UnitTools.getCurrentMonthDays = function(){
    var now = new Date();
    now.setDate(0);
    return now.getDate();
}

//很久以前
UnitTools.longlongago = function(){
    var longago = new Date();
    longago.setYear(1800);
    return longago;
}



//是否在同一个月
UnitTools.isInSameMonth = function(oldDate,newDate){
    if(oldDate == null || newDate == null)return true;
    if(oldDate.getFullYear()==newDate.getFullYear() && oldDate.getMonth() == newDate.getMonth())return true;
    return false;
}

//是否同一天
UnitTools.isInSameDay = function(oldDate,newDate){
    if(oldDate == null || newDate == null)return true;
    if(oldDate.getFullYear()==newDate.getFullYear() && oldDate.getMonth() == newDate.getMonth() && oldDate.getDate()==newDate.getDate())return true;
    return false;
}

//获取每个月的第一天
UnitTools.getMonthStartDay = function () {
    var date = new Date();
    date.setDate(1);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}

//获取每个月的最后一天
UnitTools.getMonthEndDay = function () {
    var date = new Date();
    date.setMonth(date.getMonth()+1);
    date.setDate(0);
    date.setHours(23);
    date.setMinutes(59);
    date.setSeconds(59);
    date.setMilliseconds(0);
    return date;
}

//启动一个新的进程
UnitTools.startNewProcess = function(args,datacb,errorcb,closecb)
{
    var child_process = require('child_process');
    var child = child_process.spawn("node", args);
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function (data) {
        datacb(data);
    });

//监听子进程的错误流数据
    child.stderr.on('data', function (data) {
        var c = data.toString('utf8');
        errorcb(c);
    });

//监听子进程的退出事件
    child.on('close', function (code) {
        closecb("子程序退出"+code);
    });
    return child;
}

UnitTools.doCommond = function (cmdStr,datacb,errorcb,closecb) {
    var child_process = require('child_process');
    var child = child_process.spawn(cmdStr,[]);
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function (data) {
        datacb(data);
    });

//监听子进程的错误流数据
    child.stderr.on('data', function (data) {
        var c = data.toString('utf8');
        errorcb(c);
    });

//监听子进程的退出事件
    child.on('close', function (code) {
        closecb("子程序退出"+code);
    });
    return child;
}

//将数组两个两个转换为json,第一个参数为值的key
UnitTools.arrayToJsonArray = function(array,key){
    var jsonArray = [];
    if(UnitTools.isArray(array) == false){
        return [];
    }
    for(var index = 0; index < array.length;index+=2){
        var data = {};
        var dataDet = data[array[index]] = {};
        dataDet[key] = array[index+1];
        jsonArray.push(data);
    }
    return jsonArray;
}

//将Array转换为字符串没有都好
UnitTools.arrayToStringNoComma = function (oneArray) {
    var result = "";
    UnitTools.forEach(oneArray,function (index,value) {
        result+=value;
    })
    return result;
}

UnitTools.md5 = function(value){
    var crypto = require('crypto');
    var decipher = crypto.createHash('md5');
    return decipher.update(value).digest('hex')
}

UnitTools.deepCopy = function (object) {
    return JSON.parse(JSON.stringify(object));
}

UnitTools.deepCopy2 = function (object) {
    return Object.assign({},object);
}

UnitTools.washArray = function (arr) {
    var cards = arr;
    for(var i = 0;i<cards.length;i++)
    {
        var randomIndex = UnitTools.random(0,cards.length-1);
        var temp = cards[i];
        cards[i] = cards[randomIndex];
        cards[randomIndex] = temp;
    }
    return cards;
}

UnitTools.processError = function(cb){
    process.on('uncaughtException', function (err) {
        cb(err);
    });
}

UnitTools.setProcessInfo = function(groupmask,name,ip,id){
    process.title = groupmask+":"+name+" "+id+" "+ip;
}

//检查手机号
UnitTools.checkMobile = function (str) {
    var re = /^1\d{10}$/
    if (re.test(str)) {
        return true;
    } else {
        return false;
    }
}

// input  [1,2] ,[1]  1 ,2  [[1,2],[2,3]] [1] output [1,2][1] [2,3][1]
UnitTools.combination = function () {
    var args = Array.prototype.slice.apply(arguments);
    var floorNums = arguments.length;
    var floorCounter = {};
    var getOrCreateCounter = function (floor) {
        if(UnitTools.isNullOrUndefined(floorCounter[floor])){
            return floorCounter[floor] = 0;
        }
        return floorCounter[floor];
    }

    //检测层次的游标，如果超出范围，就重置为0
    var checkFloorCounterOrReset = function (floor) {
        if(floor >=floorNums)return;
        var index = getOrCreateCounter(floor);
        if(index>=args[floor].length){
            floorCounter[floor] = 0;
        }
    }

    //如果返回false 表示结束
    var checkAndMoveFloorIndex = function () {
        for(var i = floorNums-1;i>=0;i--){
            addFloorIndex(i);
            if(!checkFloorIsEnd(i)){
                break;
            }
        }
    }
    
    var getNiceFloorCounter = function (floor) {
        var index = getOrCreateCounter(floor);
        if(index>=args[floor].length){
           return 0;
        }
        return index;
    }
    
    var checkFloorIsEnd = function (floor) {
        if(floor>=floorNums)return true;
        var index = getOrCreateCounter(floor);
        if(index>=args[floor].length){
            return true;
        }
        return false;
    }


    //给层次的游标增加1
    var addFloorIndex = function (floor) {
        var index = getOrCreateCounter(floor);
        index+=1;
        floorCounter[floor] = index;
    }

    var topFloor = 0;
    var bottomFloor = floorNums -1;

    var result = [];
    var done = false;
    while (!done){
        var combine = [];
        for(var i = 0;i<floorNums;i++){
            var floor = i;
            if(checkFloorIsEnd(topFloor)){
                done = true;
            }
            if(floor == bottomFloor){
                checkFloorCounterOrReset(floor);
                var currentFloorIndex = getNiceFloorCounter(floor);
                var info = args[floor][currentFloorIndex];
                combine.push(info);
                checkAndMoveFloorIndex();
            }else{
                checkFloorCounterOrReset(floor);
                var currentFloorIndex = getNiceFloorCounter(floor);
                var info = args[floor][currentFloorIndex];
                combine.push(info);
            }
        }
        if(done)break;
        result.push(combine);
    }
    return result;

}

UnitTools.combinationWithElementCb = function (elementcb) {
    var args = Array.prototype.slice.apply(arguments);
    var args = args.slice(1);
    var floorNums = args.length;
    var floorCounter = {};
    var getOrCreateCounter = function (floor) {
        if(UnitTools.isNullOrUndefined(floorCounter[floor])){
            return floorCounter[floor] = 0;
        }
        return floorCounter[floor];
    }

    //检测层次的游标，如果超出范围，就重置为0
    var checkFloorCounterOrReset = function (floor) {
        if(floor >=floorNums)return;
        var index = getOrCreateCounter(floor);
        if(index>=args[floor].length){
            floorCounter[floor] = 0;
        }
    }

    //如果返回false 表示结束
    var checkAndMoveFloorIndex = function () {
        for(var i = floorNums-1;i>=0;i--){
            addFloorIndex(i);
            if(!checkFloorIsEnd(i)){
                break;
            }
        }
    }

    var getNiceFloorCounter = function (floor) {
        var index = getOrCreateCounter(floor);
        if(index>=args[floor].length){
            return 0;
        }
        return index;
    }

    var checkFloorIsEnd = function (floor) {
        if(floor>=floorNums)return true;
        var index = getOrCreateCounter(floor);
        if(index>=args[floor].length){
            return true;
        }
        return false;
    }


    //给层次的游标增加1
    var addFloorIndex = function (floor) {
        var index = getOrCreateCounter(floor);
        index+=1;
        floorCounter[floor] = index;
    }

    var topFloor = 0;
    var bottomFloor = floorNums -1;

    var done = false;
    while (!done){
        var combine = [];
        for(var i = 0;i<floorNums;i++){
            var floor = i;
            if(checkFloorIsEnd(topFloor)){
                done = true;
            }
            if(floor == bottomFloor){
                checkFloorCounterOrReset(floor);
                var currentFloorIndex = getNiceFloorCounter(floor);
                var info = args[floor][currentFloorIndex];
                combine.push(info);
                checkAndMoveFloorIndex();
            }else{
                checkFloorCounterOrReset(floor);
                var currentFloorIndex = getNiceFloorCounter(floor);
                var info = args[floor][currentFloorIndex];
                combine.push(info);
            }
        }
        if(done)break;
        elementcb(combine);
    }
}

UnitTools.combinationWithElementCbForceStop = function (elementcb,forceStop) {
    var args = Array.prototype.slice.apply(arguments);
    var args = args.slice(2);
    var floorNums = args.length;
    var floorCounter = {};
    var getOrCreateCounter = function (floor) {
        if(UnitTools.isNullOrUndefined(floorCounter[floor])){
            return floorCounter[floor] = 0;
        }
        return floorCounter[floor];
    }

    //检测层次的游标，如果超出范围，就重置为0
    var checkFloorCounterOrReset = function (floor) {
        if(floor >=floorNums)return;
        var index = getOrCreateCounter(floor);
        if(index>=args[floor].length){
            floorCounter[floor] = 0;
        }
    }

    //如果返回false 表示结束
    var checkAndMoveFloorIndex = function () {
        for(var i = floorNums-1;i>=0;i--){
            addFloorIndex(i);
            if(!checkFloorIsEnd(i)){
                break;
            }
        }
    }

    var getNiceFloorCounter = function (floor) {
        var index = getOrCreateCounter(floor);
        if(index>=args[floor].length){
            return 0;
        }
        return index;
    }

    var checkFloorIsEnd = function (floor) {
        if(floor>=floorNums)return true;
        var index = getOrCreateCounter(floor);
        if(index>=args[floor].length){
            return true;
        }
        return false;
    }


    //给层次的游标增加1
    var addFloorIndex = function (floor) {
        var index = getOrCreateCounter(floor);
        index+=1;
        floorCounter[floor] = index;
    }

    var topFloor = 0;
    var bottomFloor = floorNums -1;

    var done = false;
    while (!done && !forceStop()){
        var combine = [];
        for(var i = 0;i<floorNums;i++){
            var floor = i;
            if(checkFloorIsEnd(topFloor)){
                done = true;
                return;
            }
            if(floor == bottomFloor){
                checkFloorCounterOrReset(floor);
                var currentFloorIndex = getNiceFloorCounter(floor);
                var info = args[floor][currentFloorIndex];
                combine.push(info);
                checkAndMoveFloorIndex();
            }else{
                checkFloorCounterOrReset(floor);
                var currentFloorIndex = getNiceFloorCounter(floor);
                var info = args[floor][currentFloorIndex];
                combine.push(info);
            }
        }
        elementcb(combine);
    }
}

//传递一个controller来控制一步一步的执行 返回true继续执行，返回false 则不执行
UnitTools.combinationWithElementCbAndController = function (elementcb,controller) {
    var counts = 0;
    var args = Array.prototype.slice.apply(arguments);
    var args = args.slice(2);
    var floorNums = args.length;
    var floorCounter = {};
    var getOrCreateCounter = function (floor) {
        if(UnitTools.isNullOrUndefined(floorCounter[floor])){
            return floorCounter[floor] = 0;
        }
        return floorCounter[floor];
    }

    //检测层次的游标，如果超出范围，就重置为0
    var checkFloorCounterOrReset = function (floor) {
        if(floor >=floorNums)return;
        var index = getOrCreateCounter(floor);
        if(index>=args[floor].length){
            floorCounter[floor] = 0;
        }
    }

    //如果返回false 表示结束
    var checkAndMoveFloorIndex = function () {
        for(var i = floorNums-1;i>=0;i--){
            addFloorIndex(i);
            if(!checkFloorIsEnd(i)){
                break;
            }
        }
    }

    var getNiceFloorCounter = function (floor) {
        var index = getOrCreateCounter(floor);
        if(index>=args[floor].length){
            return 0;
        }
        return index;
    }

    var checkFloorIsEnd = function (floor) {
        if(floor>=floorNums)return true;
        var index = getOrCreateCounter(floor);
        if(index>=args[floor].length){
            return true;
        }
        return false;
    }


    //给层次的游标增加1
    var addFloorIndex = function (floor) {
        var index = getOrCreateCounter(floor);
        index+=1;
        floorCounter[floor] = index;
    }

    var topFloor = 0;
    var bottomFloor = floorNums -1;

    var done = false;
    var nextSetpFunction = function () {
        setImmediate(function () {
            if(!controller()){
                nextSetpFunction();
                return;
            }
            //console.log("进来了");
            var combine = [];
            for(var i = 0;i<floorNums;i++){
                var floor = i;
                if(checkFloorIsEnd(topFloor)){
                    done = true;
                    break;
                }
                if(floor == bottomFloor){
                    checkFloorCounterOrReset(floor);
                    var currentFloorIndex = getNiceFloorCounter(floor);
                    var info = args[floor][currentFloorIndex];
                    combine.push(info);
                    checkAndMoveFloorIndex();
                }else{
                    checkFloorCounterOrReset(floor);
                    var currentFloorIndex = getNiceFloorCounter(floor);
                    var info = args[floor][currentFloorIndex];
                    combine.push(info);
                }
            }
            if(done){
                console.log("结束了");
                console.log("总共多少种组合:"+counts);
                return;
            }
            counts+=1;
            elementcb(combine);
            nextSetpFunction();
        });
    }
    nextSetpFunction();
}

UnitTools.combinationWithElementCbAndEndController = function (elementcb,controller,donecb) {
    var counts = 0;
    var args = Array.prototype.slice.apply(arguments);
    var args = args.slice(3);
    var floorNums = args.length;
    var floorCounter = {};
    var getOrCreateCounter = function (floor) {
        if(UnitTools.isNullOrUndefined(floorCounter[floor])){
            return floorCounter[floor] = 0;
        }
        return floorCounter[floor];
    }

    //检测层次的游标，如果超出范围，就重置为0
    var checkFloorCounterOrReset = function (floor) {
        if(floor >=floorNums)return;
        var index = getOrCreateCounter(floor);
        if(index>=args[floor].length){
            floorCounter[floor] = 0;
        }
    }

    //如果返回false 表示结束
    var checkAndMoveFloorIndex = function () {
        for(var i = floorNums-1;i>=0;i--){
            addFloorIndex(i);
            if(!checkFloorIsEnd(i)){
                break;
            }
        }
    }

    var getNiceFloorCounter = function (floor) {
        var index = getOrCreateCounter(floor);
        if(index>=args[floor].length){
            return 0;
        }
        return index;
    }

    var checkFloorIsEnd = function (floor) {
        if(floor>=floorNums)return true;
        var index = getOrCreateCounter(floor);
        if(index>=args[floor].length){
            return true;
        }
        return false;
    }


    //给层次的游标增加1
    var addFloorIndex = function (floor) {
        var index = getOrCreateCounter(floor);
        index+=1;
        floorCounter[floor] = index;
    }

    var topFloor = 0;
    var bottomFloor = floorNums -1;

    var done = false;
    var nextSetpFunction = function () {
        setImmediate(function () {
            if(!controller()){
                return;
            }
            //console.log("进来了");
            var combine = [];
            for(var i = 0;i<floorNums;i++){
                var floor = i;
                if(checkFloorIsEnd(topFloor)){
                    done = true;
                    break;
                }
                if(floor == bottomFloor){
                    checkFloorCounterOrReset(floor);
                    var currentFloorIndex = getNiceFloorCounter(floor);
                    var info = args[floor][currentFloorIndex];
                    combine.push(info);
                    checkAndMoveFloorIndex();
                }else{
                    checkFloorCounterOrReset(floor);
                    var currentFloorIndex = getNiceFloorCounter(floor);
                    var info = args[floor][currentFloorIndex];
                    combine.push(info);
                }
            }
            if(done){
                donecb(counts);
                return;
            }
            counts+=1;
            elementcb(combine);
            nextSetpFunction();
        });
    }
    nextSetpFunction();
}



module.exports = UnitTools;

// var data = new Date();
// data.setDate(20);
// console.log(UnitTools.isInSameDay(new Date(),data));

//console.log(UnitTools.getCurrentMonthDays());

//(function test(){
//    console.log(UnitTools.md5("sdfsdf4e3345sdfsdefsdf"));
//})();

//console.log(UnitTools.isNumber(20));

//测试获取每个月的第一天和最后一天
//console.log(UnitTools.getMonthStartDay().toLocaleString());
//console.log(UnitTools.getMonthEndDay().toLocaleString());


// var result = UnitTools.combination([[1,2,8]],[3,4,9],[5,6,7]);
// console.log(result);

// var array = [2,2,2,2];
// UnitTools.removeArray(array,[2,2,2]);
// console.log(array);
//
// console.log(UnitTools.arrayHasValue("1",array));

//array = UnitTools.removeArrayAll(array,[1]);
//console.log(array);


// console.log(UnitTools.arrayHasValueNum(1,[1,2,3,1,1,1,1]));

// console.log(UnitTools.arrayHasArray([1,2],[3]));