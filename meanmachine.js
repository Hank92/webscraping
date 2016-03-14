var express = require('express'),
	app = express();
	request = require('request'),
	cheerio = require('cheerio'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	fs = require('fs'),
	port = process.env.Port || 8000;
	mongoose = require('mongoose');
	User = require('./app/models/user');

 mongoose.connect('mongodb://HongJik:bjhv6cps3655@jello.modulusmongo.net:27017/iJujyr6a'); 

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(function(req, res, next){
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, /Authorization');
		next();
});

app.use(morgan('dev'));


app.get('/', function(req, res){
	res.send('Welcome to the home page!');
})

var apiRouter = express.Router();

apiRouter.use(function(req, res, next) { 
	console.log('Somebody just came to our app!'); 
	next();
});


apiRouter.get('/', function(req, res){
	res.json({message: "Welcome to Api!"});
})

 apiRouter.route('/users')  
 .post(function(req, res) {  
 var user = new User();  
 user.name = req.body.name; 
 user.username = req.body.username; 
 user.password = req.body.password; 
 user.save(function(err) { if (err) { 
  if (err.code == 11000) return res.json({ success: false, message: 'A user with that username already exists. ' 
}); 
  else  
  	return res.send(err); }  
   res.json({ message: 'User created!' }); 
   }); 
    })

app.use('/api', apiRouter);
app.listen(port);

console.log("Its working!")
