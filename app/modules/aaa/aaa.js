// ?&ts=" + Date.parse(new Date())
define(["avalon", "text!./aaa.html"], function(avalon, aaa) {
	avalon.templateCache.aaa = aaa
    var model=avalon.define({
        $id: "aaa",
        username: "test"		
    })
	model.$watch("username",function(a,b){
		avalon.log(model.username);
	})
    avalon.vmodels.root.page = "aaa"
})