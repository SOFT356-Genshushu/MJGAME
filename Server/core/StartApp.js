/**
 * Created by litengfei on 16/7/1.
 */
var App = require("./app.js");
var UnitTools = require("./UnitTools.js");
var app = new App();
App.instance = app;

UnitTools.processError(function(err){
    app.logError({error:err.toString(),stack:err.stack.toString()});
});

app.startWithArgs();



