//将app定义成一个amd模块，依赖于angular,这样requirejs
//加载app时会自动加载angular.
define(['./module'], function (controllers) {
    //使用严格模式
    'use strict';
    controllers.controller('MyCtrl2', [
        function ($scope) {
            console.log("MyCtrl2：");
        }
    ]);

});