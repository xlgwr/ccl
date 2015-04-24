//'use strict';
// ?&ts=" + Date.parse(new Date())
define(["avalon", "text!./aaa.html", "css!./aaa.css"], function (avalon, aaa) {
    avalon.log("start aaa.js");
    avalon.templateCache.aaa = aaa

    var widgets = []; //["Business Development","Finance","Marketing","Orders","PE","Production","SCM","Warehouse"].sort()
    var updateHistory = false //将此url更新入浏览历史

    //'http://172.16.122.50:3001'
    //for ajax 
    var tmpurl = config.apiIp + '/qadreportsurls/' //ajax url
    //var curSubName = unescape(window.location.href.split("&")[0].split('=')[1]);
    //var tmpurlItems = tmpurl + curSubName
    //avalon.log("DDDD:"+curSubName);
    //avalon.log("3item:"+config.acaoIp);
    var prefixReport = 'http://portal.cclmotors.com/_layouts/15/ReportServer/RSViewerPage.aspx?rv:RelativeReportUrl=/';


    avalon.log("2:" + config.apiIp);
    // var model=avalon.define({
    // $id: "aaa",
    // username: "test1"		
    // })		
    function getDatas(number) {
        var data = []
        for (var i = 0; i < number; i++) {
            data.push({
                name: "shirly" + i,
                age: parseInt(10 + Math.random() * 20),
                selected: i % 3 ? false : true,
                salary: parseInt(Math.random() * 100),
                operate: i % 5 ? 0 : 1,
                busy: !i % 3 && !i % 5 ? 0 : 1
            })
        }
        return data
    };
    function replaceLocation(location) {
        if (history.replaceState) {
            history.replaceState("", "new state", location)
        } else { //IE10以下
            window.location.replace(location)
        }
    }
    require(["mmRequest", "./oniui/smartgrid/avalon.smartgrid",
			"./oniui/button/avalon.button",
			"./oniui/dialog/avalon.dialog", 'domReady!'], function (vm) {
			    //start
			    var vmodel = avalon.define("aaa", function (vm) {
			        vm.$skipArray = ["ajaxGetJSON", "ajaxGetJSONSub", "changeActiveIndex", "opts"]
			        vm.none = 'none';
			        //widgets
			        vm.widgets = widgets
			        vm.aname = "Business  Development";
			        vm.aprefix = "";
			        vm.activeIndex = 0
			        vm.widgetHref = ""
			        vm.frameContentHeight = 600 //默认iframe高度，过后通过iframeLoaded重新设置
			        //end widgets

			        //define for ajax left menu
			        vm.itemsdata = []
			        vm.aurl = ''
			        vm.afind = ''
			        vm.curdata = []
			        vm.none = 'none'
			        //focus
			        vm.focus = function () {
			            avalon.log("this focus。");
			        }
			        //ajax for left menu
			        vm.state = {
			            text: '无请求',
			            setSend: function (sendType) {
			                vmodel.state.text = sendType + ' 请求中...';
			            },
			            setSucc: function (data) {
			                vmodel.state.text = '请求成功！请求类型：' + data.sendType;
			            }
			        }
			        vm.ajaxGetJSON = function () {
			            var sendType = 'avalon.ajax';
			            vmodel.state.setSend(sendType);

			            avalon.ajax({
			                url: tmpurl,
			                data: {
			                    sendType: sendType
			                },
			                dataType: 'json',
			                cache: false
			            }).done(function (res) {
			                //avalon.log(res);
			                vmodel.state.setSucc(res);
			                res.push({ "name": "All", "value": "All" })
			                // vmodel.widgets=res.sort(function(a,b){
			                // //console.log(a['value'].substring(0,1)+','+b['value'].substring(0,1));
			                // return a['value'].substring(0,1)>b['value'].substring(0,1);								
			                // });
			                vmodel.widgets = res
			                vmodel.changeActiveIndex(-1);
			                vmodel.ajaxGetJSONSub();
			            });
			        }
			        vm.changeActiveIndex = function (index, e) { //左侧边栏点击和页面初始化时，更新iframe的src以及页面url
			            if (!vm.widgets.length) {
			                avalon.log('vm:' + vm.widgets + ' is null.');
			                return;
			            }
			            if (index !== -1) { //左侧边栏点击
			                if (vm.widgets[index]['value'] == "mmRouter") {
			                    window.open("mmRouter/avalon.mmRouter.doc.html")
			                    return e.preventDefault()
			                }
			                vm.activeIndex = index
			                vm.aname = vm.widgets[index]['value']
			            } else { //页面初始化
			                if (location.href.indexOf("#") > -1) { //exp: http.....avalon.oniui/index.html#avalon.datepicker.doc.html
			                    var curLocation = location.href.split("#")[1] //exp: avalon.datepicker.doc.html
			                    vm.aname = curLocation.split(".")[1] //exp: datepicker
			                    vm.activeIndex = vm.widgets.indexOf(name)
			                } else { //exp：..../index.html
			                    vm.aname = "Business  Development"//Business  Development
			                }
			            }
			            vm.aprefix = 'report'; //name //处理一般情况
			            switch (vm.aname) {
			                case "coupledatepicker": //都在datepicker目录下
			                case "daterangepicker":
			                    vm.aprefix = "report"
			                    break
			                case "html": //处理默认无后缀情况
			                    vm.aname = "Business  Development"
			                    vm.aprefix = "report"
			                    break
			            }
			            if (window.location.href.indexOf("?ex") > -1 && index === -1) { //ex页面，exp:...avalon.oniui/index.html#avalon.datepicker.doc.html?ex=ex1
			                vm.widgetHref = vm.aprefix + "/" + vm.aname + "." + window.location.href.split("example=")[1] + ".html" //寻找目录下示例页
			            } else {
			                var curLocation = window.location.href.split("#")[0]
			                vm.widgetHref = 'pages/' + vm.aprefix + "/items.html?sub=" + name + "&ts=" + Date.parse(new Date()) //使页面刷新
			                replaceLocation(curLocation + "#report." + vm.aname + ".html") //页面

			            }
			            updateHistory = true //需要更新入浏览历史
			        }

			        /////////////////end for ajax fomenu

			        //start for right data
			        vm.ajaxGetJSONSub = function () {
			            var sendType = 'avalon.ajax';
			            vmodel.state.setSend(sendType);

			            avalon.ajax({
			                url: tmpurl + vmodel.aname,
			                data: {
			                    sendType: sendType
			                },
			                dataType: 'json',
			                cache: false
			            }).done(function (res) {
			                //avalon.log(res);							
			                vm.itemsdata = res;
			                vmodel.state.setSucc(res);
			                vmodel.render(res);

			            });
			        }
			        //end ajax
			        vm.render = function (data) {
			            //data[0].checkboxShow = true
			            vmodel.aurl = prefixReport
			            vmodel.none = 'block'
			            vmodel.curdata = data
			            if (data) {
			                var sg1 = avalon.vmodels.sg1
			                //avalon.log("render:data");
			                sg1.render(data)
			            }
			        }
			        vm.searchFocus = function () {
			            avalon.bind(document, "keypress", function (e) {
			                var currKey = 0,
							e = e || event;
			                if (e.keyCode == 13) {
			                    vmodel.search(e);
			                }
			            })
			        }
			        vm.search = function searchInArr(e) {
			            //avalon.log(e);
			            if (vm.afind) {
			                var newitem = vmodel.itemsdata.filter(function (value, index, ar) {
			                    //avalon.log(value)
			                    if (value[index, 'value'].toLowerCase().indexOf(vm.afind.toLowerCase()) !== -1 ||
						   value[index, 'rdesc'].toLowerCase().indexOf(vm.afind.toLowerCase()) !== -1)
			                        return value;
			                });
			                vmodel.render(newitem);
			            } else {
			                vmodel.render(vmodel.itemsdata);
			            }
			        }
			        vm.aclick = function () {
			            var tampurl = this;
			            avalon.log('aaaaaaaaaaaaaaa:' + tampurl);
			            window.open(tampurl);
			            return;
			        }
			        vm.opts = {
			            // 不希望组件的配置项被smartgrid监控，将其放到$skipArray数组中，添加其他组件同理
			            $skipArray: ["switchdropdown", "dropdown", "pager"],
			            //selectable: {
			            //type: "Checkbox" //为表格添加选中行操作框,可以设置为"Checkbox"或者"Radio"
			            //},
			            isAffix: true,
			            pager: {
			                onJump: function (e, pagerVM) {
			                    avalon.log("changePage event, currentPage is : ")
			                    avalon.log(pagerVM)
			                },
			                canChangePageSize: true,
			                options: [10, 20, 50, 100], //默认[10,30,50]
			                dropdown: {
			                    // 为了跟busy列的onChange事件混淆，将表格底部页面显示数的选项change事件配置在pager配置项中
			                    //这是基于avalon会优先查找最近的vmodel上的属性
			                    onChange: function (newValue, oldValue, vmodel) {
			                        avalon.log("pager dropdown")
			                        avalon.log("pageSize is : " + newValue)
			                        avalon.log("arguments is : ")
			                        avalon.log(arguments)
			                    }
			                }
			            },
			            pageable: false, //show page
			            showLoading: true,
			            //canChangePageSize: true,
			            dropdownData: [{ // dropdown的数据信息
			                name: "忙",
			                value: "1"
			            }, {
			                name: "不忙",
			                value: "0"
			            }],
			            dropdown: {
			                width: 100,
			                listWidth: 100
			            },
			            htmlHelper: { // 渲染列数据的方法集合
			                // 包装工资列的数据
			                $X: function (vmId, field, index, cellValue, rowData) {//所有包装函数都会收到4个参数，分别是smartgrid组件对应vmodel的id，列标志(key)，列索引，列数据值
			                    //avalon.log("arguments is : ")
			                    //avalon.log(arguments)
			                    var aurl = vmodel.aurl + escape(rowData['name'] + '/' + cellValue)
			                    //avalon.log(aurl)ms-click='aclick'
			                    //avalon.log(aurl);
			                    return "<a href='" + aurl + "' target='_blank'>" + cellValue + "</a>"
			                },
			                // operate列包装成switchdropdown组件
			                switchdropdown: function (vmId, field, index, cellValue, rowData, disable) {
			                    var openOption = cellValue == 0 ? '<option value="0" selected>启用</option>' : '<option value="0">启用</option>',
                                pauseOption = cellValue == 1 ? '<option value="1" selected>暂停</option>' : '<option value="1">暂停</option>'

			                    return ['<select ms-widget="switchdropdown" rowindex="' + index + '" field="' + field + '"  vmId="' + vmId + '" ' + (disable ? "disabled" : "") + '>', openOption, pauseOption, '</select>'].join('')
			                },
			                // busy列包装成dropdown组件
			                dropdown: function (vmId, field, index, cellValue, rowData, disable) {
			                    var option = "<option ms-repeat='dropdownData' ms-attr-value='el.value' ms-attr-label='el.name' ms-selected='el.value == " + cellValue + "'></option>"
			                    return '<select ms-widget="dropdown" rowindex="' + index + '" field="' + field + '" vmId="' + vmId + '" ' + (disable ? "disabled" : "") + '>' + option + '</select>'
			                }
			            },
			            columns: [
                        {
                            key: "value",
                            name: "报表名",
                            sortable: true, //是否可排序
                            isLock: true, //是否锁死列让其始终显示
                            align: "left", //列的对象方式
                            //defaultValue: "shirly", //列的默认值
                            customClass: "ddd", //自定义此列单元格类
                            toggle: false,
                            sortable: true,
                            width: 100,
                            format: "$X" // 定义渲染数据的方法名
                        },
						{
						    key: "rdesc",
						    name: "说明",
						    sortable: true, //是否可排序
						    isLock: true, //是否锁死列让其始终显示
						    align: "left", //列的对象方式
						    defaultValue: "", //列的默认值
						    customClass: "ddd", //自定义此列单元格类
						    toggle: false,
						    sortable: true,
						    width: 200
						    //format: "$X" // 定义渲染数据的方法名
						}],
			            data: [], //getDatas(8),
			            // 用户鼠标选中行或者不选中行的回调
			            onRowSelect: function (rowData, isSelected) {
			                avalon.log("onRowSelect callback , arguments is : ")
			                avalon.log(arguments)
			            },
			            // 用户鼠标操作进行全选或者全不选的回调
			            onSelectAll: function (datas, isSelectedAll) {
			                avalon.log("onSelectAll callback")
			                avalon.log(arguments)
			            },
			            // 本地排序的回调
			            onColumnSort: function (sortType, field) {
			                avalon.log("onColumnSort callback")
			                avalon.log(arguments)
			            }

			        }
			        //avalon.log(vm);
			        /////////////////////////////////////end define for vmodel
			    });
			    vmodel.$watch("aname", function (a, b) {
			        avalon.log("UserName:" + a + "," + b);
			        vmodel.ajaxGetJSONSub()
			    });
			    vmodel.$watch('afind', function (a) {
			        //avalon.log(a);
			        vmodel.search();
			        //avalon.log(newitem);
			    });

			    avalon.vmodels.page.pagesrc = "aaa"
			    avalon.log("load: init");
			    vmodel.ajaxGetJSON();
			    
			    avalon.scan();

			});
    ///////////////////////end require

})