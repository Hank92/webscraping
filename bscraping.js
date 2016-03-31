var request = require('request'),
	cheerio = require('cheerio'),
	express = require('express'),
	app = express(),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	morgan = require('morgan'),
	path = require('path'),
	iconv  = require('iconv-lite');


//configuration//
//var configDB = require('./config/database.js');
//var postModel = require('../app/models/post.js');

mongoose.connect("mongodb://hongjik:bjhv6c@jello.modulusmongo.net:27017/yveGib5o");//connect to our database
//mongoose.connect("mongodb://hongjik92:bjhv6c@jello.modulusmongo.net:27017/nudoB9ad");
	app.use(morgan('dev'));
	app.use(bodyParser.json()); //setting app to use bodyParser
	app.set('view engine', 'ejs'); //set up ejs for templating

var postModel = mongoose.model('Post',{
	title: String, 
	url  : String,
	image_url: String,
	comments: [] 
});
/*
var commentModel = mongoose.model('Comment',{
	content: String
})
*/
/*
request('https://www.reddit.com/r/NSFW_GIF/?count=25&after=t3_4c75p4', function(err, res, body){
	
	if(!err && res.statusCode == 200) {
		
		var $ = cheerio.load(body);
		$('#siteTable').each(function(){
		var newPost = $(this).find('p a').attr('href');
		var newHref = $(this).find('a').attr('href');
		var image_url = $(this).find('a img').attr('src');
		
		
			request(bhuUrl, function(err, res, body){
				if(!err && res.statusCode == 200) {
				var $ = cheerio.load(body);
				
					var img_url = $('span div img').attr('src');
					
			postModel.find({title: newPost}, function(err, newPosts){
				
				if (!newPosts.length){
					//save data in Mongodb
					var Post = new postModel({
						title: newPost,
						url: bhuUrl,
						image_url: img_url
					})
			Post.save(function(error){
					if(error){
						console.log(error);
					}
					else 
						console.log(Post);
				})
			//	
				}
			})
			
			}//if문
			})//request
			
		});
		
	}//첫 if구문
});
*/
request('http://bhu.co.kr/bbs/board.php?bo_table=best&page=36', function(err, res, body){
	
	if(!err && res.statusCode == 200) {
		
		var $ = cheerio.load(body);
		$('td.subject').each(function(){
		var newPost = $(this).find('a font').text();
		var newHref = $(this).find('a').attr('href');
		newHref = newHref.replace("≀","&");
		newHref = newHref.replace("id","wr_id");
		newHref = newHref.replace("..",".");
		var bhuUrl = "http://www.bhu.co.kr"+ newHref;
	 	
			request(bhuUrl, function(err, res, body){
				if(!err && res.statusCode == 200) {
				var $ = cheerio.load(body);
				var comments =[];
					var img_url = $('span div img').attr('src');

					$('#commentContents').each(function(){
						var comment = $(this).find('td div:nth-last-child(3)').text();
							comments.push(comment); 	
					})
					
			postModel.find({title: newPost}, function(err, newPosts){
				
				if (!newPosts.length){
					//save data in Mongodb

					var Post = new postModel({
						title: newPost,
						url: bhuUrl,
						image_url: img_url,
						comments: comments
					})
			Post.save(function(error){
					if(error){
						console.log(error);
					}
					else 
						console.log(Post);
				})
			//post.save
				}//if newPosts안에 있는 {}

			})//postModel.find
			

			}//if문

			})//request

			
		});
		
	}//첫 if구문

});

request('http://bhu.co.kr/bbs/best.php', function(err, res, body){
	
	if(!err && res.statusCode == 200) {
		
		var $ = cheerio.load(body);
		$('td.subject').each(function(){
		var newPost = $(this).find('a font').text();
		var newHref = $(this).find('a').attr('href');
		newHref = newHref.replace("≀","&");
		newHref = newHref.replace("id","wr_id");
		newHref = newHref.replace("..",".");
		var bhuUrl = "http://www.bhu.co.kr"+ newHref;
	
			request(bhuUrl, function(err, res, body){
				if(!err && res.statusCode == 200) {
				var $ = cheerio.load(body);
				
					var img_url = $('span div img').attr('src');
					
					

			postModel.find({title: newPost}, function(err, newPosts){
				
				if (!newPosts.length){
					//save data in Mongodb

					var Post = new postModel({
						title: newPost,
						url: bhuUrl,
						image_url: img_url,

					})
			Post.save(function(error){
					if(error){
						console.log(error);
					}
					else 
						console.log(Post);
				})
			//	
				}

			})
			

			}//if문

			})//request

			
		});
		
	}//첫 if구문

});

app.param('id', function(req, res, next, id){
	postModel.findById(id, function(err, docs){
			if(err) res.json(err);
			else
			{
				req.postId = docs;
				next();
			}
		});	
});

app.get('/:id', function(req, res){
	
	res.render('individualPost.ejs', {postModel: req.postId});
});
/*
app.get('/:id', function(req, res){
	
	var Comment =new commentModel({
		content: req.body.content
	});

	Comment.save(function(err){
		if (err){
			console.log("error!")
		} else {
			res.redirect('/:id')
		};

	});
});

app.get('/:id', function(req, res){
	commentModel.find({}, function(err, all_comments){
		if(err) res.json(err);
		else    res.render('individualPost.ejs', {commentModels : all_comments})
	})
})
*/
app.get('/', function (req, res){
	
	postModel.find({}, function(err, all_postModels){ //find( {} )fetch all data
		if(err) res.json(err);
		else 	res.render('mainPage.ejs', {postModels : all_postModels}
				);
		});
});

//start the server
app.listen(3000, function(){
	console.log('Its running');
})

/*
request({url: 'http://www.ppomppu.co.kr/zboard/zboard.php?id=humor', encoding:'binary'}, function(err, res, body){
	
	if(!err && res.statusCode == 200) {
		var convertedCon = iconv.decode(body, 'euc-kr');
		
		var $ = cheerio.load(convertedCon);
		$('td.list_vspace').each(function(){
		var newPost = $(this).find('a font').text();
		var newHref = $(this).find('a').attr('href');
			var Post = new postModel({
			title: newPost,
			url: "http://www.ppomppu.co.kr/zboard/"+ newHref
		});
		
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

// routes ======================================================================
//require('./routes.js')(app); // load our routes and pass in our app