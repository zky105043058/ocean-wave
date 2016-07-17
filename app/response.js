const util = require('./util');
module.exports = {
	error: function(status,msg){
		this.statusCode = status;
		if(!msg){
			switch(status){
				case 404: msg = '页面不存在！';break;
				default: ;
			}
		}
		this.statusMessage = msg || '';
		this.setHeader('Content-Type', 'text/html; charset=utf-8')
		this.end('<h1>页面不存在 404！</h1>');
	},
	render: function(text,options){
		var opts = util.extend({},this.app.locals);
		util.extend(opts,this.locals);
		return this.app.render(text,util.extend(opts,options),this);
	}
};