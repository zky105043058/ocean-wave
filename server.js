const http = require('http');
const fs = require('fs');
const dir = __dirname;
const server = http.createServer(function(req,res){
	var text;
	if(req.url.match(/images|js/)){
		text = fs.readFileSync(dir+'/webgl'+req.url);
	}else if(req.url.indexOf('.html')>0){
		console.log(dir+'/webgl'+req.url);
		text = fs.readFileSync(dir+'/webgl'+req.url);
	}else{
		text = fs.readFileSync(dir+'/webgl/1_rotateOnMouse.html');
	}
	res.end(text);
});
server.listen(80);