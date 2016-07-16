const app = require('./app/app.js');
app.set('views',__dirname+'/webgl');
app.get('/',function(req,res){
	res.render('index');
});
app.listen(80);