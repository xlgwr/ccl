//将app定义成一个amd模块，依赖于angular,这样requirejs
//加载app时会自动加载angular.
define([
    'angular',
//'../modules/app/directives/index',
//'../modules/app/filters/index',
//'../modules/app/services/index',
    '../modules/app/controllers/index'
    ], function (ng) {
        //使用严格模式
        'use strict';
        return ng.module('docsApp', [
        //'app.services',
        //'app.filters',
        //'app.directives',
            'ngRoute',
            'ngAnimate',
            'ngMaterial',
            //'ngResource',
            'docsApp.controllers']);

    });