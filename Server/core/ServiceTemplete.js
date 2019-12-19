
/**
 * Created by litengfei on 2017/1/8.
 */
var app = require("./../core/app.js").instance;

module.exports = function () {
    var onStart = function (serverID, serviceType, serverIP, serverPort, custom) {

    }

    var onClientIn = function (session) {

    }

    var onClientOut = function (session) {
    }

    var service = {};
    return {
        service: service, onClientIn: onClientIn, onClientOut: onClientOut, onStart: onStart
    };
}