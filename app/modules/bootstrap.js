//bootstrap angular onto the window.documnet node
define([
    'require',
    'angular',
    'angular-route',
    'routes'
    ], function (require, ng) {
        //使用严格模式
        'use strict';
        require(['domReady!'], function (document) {
            ng.bootstrap(document, ['app']);
            console.log("start: app");
        });
    });