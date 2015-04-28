//将app定义成一个amd模块，依赖于angular,这样requirejs
//加载app时会自动加载angular.
define([
    'app'
    ], function (app) {
        //使用严格模式
        'use strict';
        return app.config(['$routeProvider', '$locationProvider', function ($routeProvider) {
            $routeProvider.when('/', {
                templateUrl: '/app/partials/main.html',
                controller: 'MainCtrl'
            }).when('/home', {
                templateUrl: '/app/partials/Show.html',
                controller: 'ShowCtrl'
            }).otherwise({
                redirectTo: '/home'
            });
            console.log("route:start");
            $locationProvider.html5Mode(false).hashPrefix('!');
        } ]);
    });