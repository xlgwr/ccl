//将app定义成一个amd模块，依赖于angular,这样requirejs
//加载app时会自动加载angular.
define([
    './my-ctrl-1',
    './my-ctrl-2',
    './main'
    ], function () {});