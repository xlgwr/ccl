//bootstrap angular onto the window.documnet node
define([
    'require',
    'angular',
    'angular-route',
    'angular-resource',
    'angular-animate',
    'angular-aria',
    'angular-messages',
    'angular-material',
    'angularytics',
    'docs',
    'routes'
    ], function (require, ng) {
        //使用严格模式
        'use strict';
        require(['domReady!'], function (document) {
            ng.bootstrap(document, ['docsApp']);
            console.log("start: docsApp");
        });
    });
