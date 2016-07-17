const fs = require('fs');
const http = require('http');
const Router = require('./router.js');
const resProto = require('./response');
const util = require('./util');

const app = module.exports = function(req,res){
	util.extend(res,resProto);
	res.app = app;
	app.router.handle(req,res);
}
util.extend(app,{
	init: function(){
		this.router = new Router();
		this.settings = {};
		this.locals = {};
		this.set('view engine','html');
	},
	listen: function(){
		var server = http.createServer(this);
		server.listen.apply(server,arguments);
	},
	// get方法有其它用途，合并于set中
	set: function(key,value){
		if(value != null){
			this.settings[key] = value;
			return this;
		}else{
			return this.settings[key];
		}
	},
	render: function(text,options,res){
		var views = this.set('views'),path;
		if(!views){
			throw 'app的views未设置！';
		}
		path = views + '/' + text + '.' + this.set('view engine');
		console.log('path:'+path);
		res.end(fs.readFileSync(path));
	}
	
});
var methods = ['use','all','get','post'];
methods.forEach(function(item){
	app[item] = function(){
		this.router[item].apply(this.router,arguments);
		return this;
	};
});
app.init();
