const util = require('./util');
var proto = module.exports = function(){
	function router(req,res){
		router.handle.call(router,req,res);
	}
	router.__proto__ = proto;
	router.init();
	return router;
};

util.extend(proto,{
	handle: function(req,res){
		var url = req.url,index=0;
		var me = this;
		next();
		function next(){
			var layer = me.layers[index++];
			if(!layer){
				res.error(404);
			}
			if(layer.path === ''){
				layer.fn(req,res,next);
			}else{
				while(layer && !me._matchLayer(layer,url)){
					layer = me.layers[index++];
				}
				if(!layer){
					res.error(404);
				}
				me._doLayer(layer,req,res);
			}
		}
	},
	init: function(){
		this.layers = [];
		this.layers.index = 0;
	},
	use: function(fn){
		var layer = this.layer('',fn);
		this.layers.splice(this.layers.index++,0,layer);
	},
	all: function(path,fn){
		var layer = this.layer(path,fn);
		this.layers.push(layer);
	},
	get: function(path,fn){
		var layer = this.layer(path,fn,'get');
		this.layers.push(layer);
	},
	post: function(){
		var layer = this.layer(path,fn,'post');
		this.layers.push(layer);
	},
	layer: function(path,callback,method){
		return {
			path: path.startsWith('/') ? path : '/'+path,
			fn: callback,
			method: method || 'all'
		}
	},
	_isRouter: true,
	_matchLayer: function(layer,url){
		var path = layer.path;
		return path == url || ( layer.fn._isRouter && url.startsWith( path.endsWith('/') ? path : path+'/' ) );
	},
	_doLayer: function(layer,req,res){
		if(layer.fn._isRouter){
			req.url = req.url.slice(layer.path);
		}
		layer.fn(req,res);
	}
});
