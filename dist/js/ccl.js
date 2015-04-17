avalon.ready(function(){
    var vm=avalon.define({
	$id: "box",
	w: 100,
	h: 100,
	click: function(){
	    vm.w=parseFloat(vm.w)+10;
	    vm.h=parseFloat(vm.h)+10;
	}
    });
    avalon.scan();
});
