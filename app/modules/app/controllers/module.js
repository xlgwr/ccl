//将app定义成一个amd模块，依赖于angular,这样requirejs
//加载app时会自动加载angular.
define(['angular'], function (ng) {
    //使用严格模式
    'use strict';
    return ng.module('app.controllers',[]);

});