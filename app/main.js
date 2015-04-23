require.config({
	baseUrl:'',
	paths:{
		jquery: './bower_components/jquery/dist/jquery',
		avalon: "./bower_components/avalon/avalon.shim",//必须修改源码 Or shim，禁用自带加载器，或直接删提AMD加载器模块
        text: './bower_components/text/text',
        domReady: './bower_components/domReady/domReady',
        css: './bower_components/require-css/css'
		//aaa: './modules/aaa/aaa'
    },
    priority: ['text', 'css'],
    shim: {
        jquery: {
            exports: "jQuery"
        },
        avalon: {
            exports: "avalon"
        },
		aaa: {
            exports: "aaa"
        }
    }
});
require(['avalon', "domReady!"], function() {//第二块，添加根VM（处理共用部分）
    avalon.log("加载avalon完毕，开始构建根VM与加载其他模块")
    avalon.templateCache.empty = " "
    var pages=avalon.define({
        $id: "root",
        header: "这是根模块，用于放置其他模块都共用的东西，比如<b>用户名</b>什么的",
        footer: "页脚消息",
        page: "empty"
		
    })
	pages.$watch('page',function(a,b){
			avalon.log("page:change:"+a+":"+b);
	})
    avalon.scan(document.body)
	require(['modules/aaa/aaa'], function() {//第三块，加载其他模块
        avalon.log("加载其他完毕aaa")
		// require(["text!./aaa.html"],function(a){
			 // avalon.log(a);
			 // avalon.log("load a");
		// });
		//avalon.log("加载其他完毕aaa2")
	});
});
