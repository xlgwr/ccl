//bootstrap angular onto the window.documnet node
define([
    'require',
    'angular',
    'app'
    ], function (require, ng) {
        //使用严格模式
        'use strict';
        require(['domReady!'], function (document) {
            //ng.bootstrap(windos,document,['app']);
            ng.bootstrap(document, ['app']);
            console.log("start: app");
        });
    });