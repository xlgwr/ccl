'use strict';

require.config({
    baseUrl: 'bower_components',
    paths: {
        jquery: './jquery/dist/jquery',
        angular: './angular/angular',
        'angular-route': './angular-route/angular-route',
        'angular-animate': './angular-animate/angular-animate',
        'angular-aria': './angular-aria/angular-aria',
        'angular-messages': './angular-messages/angular-messages',
        'angular-resource': './angular-resource/angular-resource',
        'angular-cookies': './angular-cookies/angular-cookies',
        'angular-material': './angular-material/angular-material',
        'angularytics': './angularytics/dist/angularytics',
        text: './text/text',
        domReady: './domReady/domReady',
        css: './require-css/css',

        'app': '../modules/app/app',
        'routes': '../modules/app/routes',
        //doc
        'docs': '../docs',
        'docsdemo': '../docs-demo-scripts',
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
        'angular-animate': {
            //exports: "angular-route"
            deps: ['angular']
        },
        'angular-messages': {
            //exports: "angular-route"
            deps: ['angular']
        },
        'angular-aria': {
            //exports: "angular-route"
            deps: ['angular']
        },
        'angular-resource': {
            deps: ['angular']
        },
        'angular-cookies': {
            deps: ['angular']
        },
        'angular-material': {
            deps: ['angular']
        },
        'angularytics': {
            deps: ['angular']
            //exports: "angularytics"
        },
        'docs': {
            deps: ['angular', 'angularytics']
        },
        'docsdemo': {
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