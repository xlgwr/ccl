// ?&ts=" + Date.parse(new Date())
define(["avalon", "text!./aaa.html","css!./aaa.css"], function(avalon, aaa) {
	avalon.log("start aaa.js");
	avalon.templateCache.aaa = aaa
	
    // var model=avalon.define({
        // $id: "aaa",
        // username: "test1"		
    // })		
	function getDatas(number) {
                var data = []
                for (var i = 0; i < number; i++) {
                    data.push({
                        name: "shirly"+i,
                        age: parseInt(10 + Math.random() * 20),
                        selected: i%3 ? false: true,
                        salary: parseInt(Math.random() * 100),
                        operate : i % 5 ? 0 : 1,
                        busy : !i%3 && !i%5 ? 0 : 1
                    })
                }
                return data
    };
	require(["./oniui/smartgrid/avalon.smartgrid",
			"./oniui/button/avalon.button",
			"./oniui/dialog/avalon.dialog"], function(vm){
		//start

			
		var model=avalon.define("aaa",function(vm){
			vm.username="test1dd";
			vm.none='none';
			
			vm.$skipArray = ["smartgrid"]
                vm.reRenderData = function() {
                    var sg1 = avalon.vmodels.sg1
					vm.none='block'
                    sg1.data = getDatas(10)
                    sg1.render()
                    // 或者直接通过sg1.render(getDatas(500))重新渲染数据
                }
                vm.clearData = function() {
                    var sg1 = avalon.vmodels.sg1
					vm.none='none';
                    sg1.data = []
                    sg1.render()
                }
                vm.smartgrid = {
                    columns: [
                        {
                            key : "name", //列标识
                            name : "姓名", //列名
                            sortable : true, //是否可排序
                            isLock : true, //是否锁死列让其始终显示
                            align: "left", //列的对象方式
                            defaultValue: "shirly", //列的默认值
                            customClass: "ddd", //自定义此列单元格类
                            toggle: false, //控制列的显示隐藏
                            width: 400 //设置列的宽度
                        }, {
                            key : "age",
                            name : "年龄",
                            sortable : true,
                            width: 300
                        }, {
                            key : "salary",
                            name : "薪水",
                            type : "Number",
                            sortable : true,
                            align: "right",
                            width: 300
                        }
                    ],
                    data: []//getDatas(10)
                }
			
			//avalon.log(vm);
		});
		model.$watch("username",function(a,b){
		avalon.log("UserName:"+model.username);
	});
	
    avalon.vmodels.page.pagesrc = "aaa"
	avalon.scan();	
	
	});	
})