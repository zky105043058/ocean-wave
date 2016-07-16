module.exports = {
	extend: function(target,src){
		var descriptor,i;
		if(!src){
			return target;
		}
		for(i in src){
			descriptor = Object.getOwnPropertyDescriptor(src,i);
			Object.defineProperty(target,i,descriptor);
		}
		return target;
	},
	each: function(arrLike,fn){
		var i,len = arrLike.length,ret;
		for(i=0;i<len;i++){
			if(fn.call(arrLike[i],arrLike[i],i) === false){
				break;
			}
		}
	}
};