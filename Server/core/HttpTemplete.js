/**
 * Created by litengfei on 2017/4/10.
 */
var express = require('express');
var webApp = express();
var bodyParser = require('body-parser')
webApp.use(bodyParser.urlencoded({extended: true}));
webApp.use(bodyParser.json())

