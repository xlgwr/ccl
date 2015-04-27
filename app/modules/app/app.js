//将app定义成一个amd模块，依赖于angular,这样requirejs
//加载app时会自动加载angular.
define('app',['angular'],function(angular){
//使用严格模式
'use strict';
var app=angular.module('app',[]);
app.controller('demo',['$scope',function($scope){
	$scope.greeting='hello,world!';
	console.log("demo");
	}]);
	return app;
});