/*const app = require('./app/app.js');
app.set('views',__dirname+'/webgl');
app.get('/',function(req,res){
	res.render('1_rotateOnMouse');
});
app.listen(80);*/
var http = require('http');
var fs = require('fs');
var server = http.createServer(function(req,res){
	var url = req.url;
	if(/js|jpg|png|gif/.test(url)){
		res.end(fs.readFileSync(__dirname+'/webgl'+url));
	}else{
		res.end(fs.readFileSync(__dirname+'/webgl/1_rotateOnMouse.html'));
	}
});
server.listen(80);