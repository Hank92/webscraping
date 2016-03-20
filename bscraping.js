var request = require('request'),
	cheerio = require('cheerio'),
	express = require('express'),
	app = express(),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	morgan = require('morgan'),
	path = require('path'),
	Iconv  = require('iconv').Iconv;


//configuration//
var configDB = require('./config/database.js');
//var postModel = require('../app/models/post.js');

mongoose.connect(configDB.url);//connect to our database

	app.use(morgan('dev'));
	app.use(bodyParser.json()); //setting app to use bodyParser
	app.set('view engine', 'ejs'); //set up ejs for templating

var postModel = mongoose.model('Post',{
	title: String, 
	url  : String
});
/*
request('http://www.bhu.co.kr/', function(err, res, body){
	
	if(!err && res.statusCode == 200) {
		var $ = cheerio.load(body);
		$('td.arr_new_list').each(function(){
		var newPost = $(this).find('a font').text();
		var newHref = $(this).find('a').attr('href');
			
		var Post = new postModel({
			title: newPost,
			url: "bhu.co.kr"+ newHref
		})
				Post.save(function(error){
					if(error){
						console.log(error);
					}
					else 
						console.log(Post);
				})
				
		});
		
	}

});
*/
request({url: 'http://www.ppomppu.co.kr/zboard/zboard.php?id=humor', encoding:'binary'}, function(err, res, body){
	
	if(!err && res.statusCode == 200) {
		var convertedCon = new Buffer(body, 'binary');
		iconv = new Iconv('euc-kr', 'UTF8');
		convertedCon = iconv.convert(convertedCon.toString());
		var $ = cheerio.load(convertedCon);
		$('td.list_vspace').each(function(){
		var newPost = $(this).find('a font').text();
		var newHref = $(this).find('a').attr('href');
			
		var Post = new postModel({
			title: newPost,
			url: "http://www.ppomppu.co.kr/zboard/"+ newHref
		})
				Post.save(function(error){
					if(error){
						console.log(error);
					}
					else 
						console.log(Post);
				})
				
		});
		
	}

});

app.get('/', function (req, res){
	
	postModel.find({}, function(err, all_postModels){ //find( {} )fetch all data
		if(err) res.json(err);
		else 	res.render('bhuscraping.ejs', {postModel : all_postModels}
				);
		});
});

// routes ======================================================================
//require('./routes.js')(app); // load our routes and pass in our app


//start the server
app.listen(3000, function(){
	console.log('Its running');
})

