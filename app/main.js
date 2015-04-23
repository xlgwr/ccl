require.config({
	baseUrl:'bower_components',
	paths:{
		jquery: './jquery/dist/jquery',
		avalon: "./avalon/avalon.shim",//必须修改源码 Or shim，禁用自带加载器，或直接删提AMD加载器模块
        text: './text/text',
        domReady: './domReady/domReady',
        css: './require-css/css',
		aaa: '/modules/aaa/aaa',
		//config
		config: '/config/config'
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
        },
		config: {
            exports: "config"
        }
    }
});
require(['avalon',"css!/vendor/styleiui/avalon.doc.css",
	"css!/vendor/styleiui/avalon.index.css", "domReady!"], function() {//第二块，添加根VM（处理共用部分）
    avalon.log("加载avalon完毕，开始构建根VM与加载其他模块")
    avalon.templateCache.empty = " "
    var page= avalon.define("page", function(vm) {
            vm.pagesrc= ''
			vm.pages = [{
                    title: "组件库",
                    href: "pages/library/index.html"
                }, {
                    title: "组件概览",
                    href: "pages/timeline/index.html"
                }, {
                    title: "APIs",
                    href: "pages/apis/index.html"
                }, {
                    title: "下载",
                    href: "pages/download/index.html"
                }

            ]
            vm.changeActiveIndex = function(index) {
                vm.activeIndex = index
            }

            vm.activeIndex = 0

            vm.computeActiveIndex = function(url) {
                var url = url || location.hash.replace(/#/g, "");
                for (var i = 0, len = page.pages.length; i < len; i++) {
                    if (page.pages[i].href === url) {
                        return i;
                    }
                }
                return 0
            }

            vm.searchComponentKey = ""
            vm.searchComponent = function() {
                _findComponent(vm.searchComponentKey)
            }
            vm.searchFocus = function() {
                avalon.bind(document, "keypress", function(e) {
                    var currKey = 0,
                        e = e || event;
                    if (e.keyCode == 13) {
                        _findComponent(vm.searchComponentKey)
                    }
                })
            }

            vm.searchFailVisible = 0
            vm.searchLastVisible = 0
        })
        page.activeIndex = page.computeActiveIndex()
        require(["./oniui/uptop/avalon.uptop","domReady!"], function() {
            avalon.define("oniui_uptop", function(vm) {
                vm.width = 120,
                vm.animate = true
            })
        })		
	//end pages   
	page.$watch('pagesrc',function(a,b){
			avalon.log("page:change:"+a+":"+b);
	})
    //avalon.scan(document.body)	
	require(['aaa'], function() {//第三块，加载其他模块
        avalon.log("加载其他完毕aaa1");		
	});		
    avalon.scan();
});
