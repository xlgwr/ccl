'use strict';

require.config({
    baseUrl: 'bower_components',
    paths: {
        jquery: './jquery/dist/jquery',
        angular: './angular/angular',
        'angular-route': './angular-route/angular-route',
        'angular-resource': './angular-resource/angular-resource',
        'angular-cookies': './angular-cookies/angular-cookies',
        text: './text/text',
        domReady: './domReady/domReady',
        css: './require-css/css',

        'app': '../modules/app/app',
        'routes': '../modules/app/routes',
        //config
        config: '../config/config'
    },
    priority: ['text', 'css'],
    shim: {
        jquery: {
            exports: "jQuery"
        },
        angular: {
            exports: "angular"
        },
        'angular-route': {
            //exports: "angular-route"
            deps: ['angular']
        },
        'angular-resource': {
            deps: ['angular']
        },
        'angular-cookies': {
            deps: ['angular']
        },
        app: {
            exports: "app"
        },
        config: {
            exports: "config"
        }

    },
    deps: ['../modules/bootstrap']
});
// require(['angular','angular-route','config'],function(angular){
// console.info(angular.version);
// console.info(config.acaoIp);
// });
//require(['app'], function(app){
//	//todo: some thing
//	console.log("start:demo");
//	
//});