var request = require('request'),
	cheerio = require('cheerio'),
	express = require('express'),
	app = express(),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	morgan = require('morgan'),
	path = require('path'),
	iconv  = require('iconv-lite');
	mongoosePaginate = require('mongoose-paginate');

//configuration//
//var configDB = require('./config/database.js');
//var postModel = require('../app/models/post.js');

mongoose.connect("mongodb://hongjik:bjhv6c@jello.modulusmongo.net:27017/Mynowu5x");//connect to our database
//mongoose.connect("mongodb://hongjik92:bjhv6c@jello.modulusmongo.net:27017/nudoB9ad");
	app.use(morgan('dev'));
	app.use(bodyParser());// pull information from html in POST
	app.use(bodyParser.json());	 //setting app to use bodyParser
	app.use(bodyParser.urlencoded());
	 
	app.set('view engine', 'ejs'); //set up ejs for templating



var postSchema = mongoose.Schema({
         title: String, 
	url  : String,
	image_url: [String],
	comments: [{
		name: String,
		content: String
	}],
	userComments: [{
		userPost: String
	}]

     });

     postSchema.plugin(mongoosePaginate);
     var postModel = mongoose.model('Post', postSchema);


request('http://bhu.co.kr/bbs/board.php?bo_table=best&page=1', function(err, res, body){
	
	if(!err && res.statusCode == 200) {
		
		var $ = cheerio.load(body);
		$('td.subject').each(function(){
		var bhuTitle = $(this).find('a font').text();
		var newHref = $(this).find('a').attr('href');
		newHref = newHref.replace("≀","&");
		newHref = newHref.replace("id","wr_id");
		newHref = newHref.replace("..",".");
		var bhuUrl = "http://www.bhu.co.kr"+ newHref;
	 	
			request(bhuUrl, function(err, res, body){
				if(!err && res.statusCode == 200) {
				var $ = cheerio.load(body);
				var comments = [];
				var image_url = [];

				$('span div img').each(function(){
					var img_url = $(this).attr('src');
					image_url.push(img_url);	
				})
				// scrape all the images for the post
				
					$("[style *= 'line-height: 180%']").each(function(index){
						var content = index + $(this).text();
							comments.push({content: content}); 	
					})//scrape all the comments for the post

			postModel.find({title: bhuTitle}, function(err, newPosts){
				
				if (!newPosts.length){
					//save data in Mongodb

					var Post = new postModel({
						title: bhuTitle,
						url: bhuUrl,
						image_url: image_url,
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
				}//if bhuTitle안에 있는 {}

			})//postModel.find
			

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

app.get('/posts/:id', function(req, res){
	var postId = req.postId;
	postId.userComments.push({ userPost: req.query.userPost});
	postId.save();
	res.render('individualPost.ejs', {postModel: postId});
	console.log(postId)//finds the matching object
});

app.post('/posts/:id', function (req, res){

	postModel.find({_id: req.params.id}, function(err, item){
		if(err) return next("error finding blog post.");
		item[0].userComments.push({userPost : req.body.userPost})
		item[0].save(function(err, data){
			if (err) res.send(err)
			else res.redirect('/posts/' + req.params.id)
		});
	})

}) //app.post    

app.get('/posts', function (req, res){
	var currentPage = 1;
	if (typeof req.query.page !== 'undefined') {
        currentPage = +req.query.page;
    	}
    	postModel.find({}, function (req, all_postModels){
    		var pageNumber = (all_postModels.length)/3;
			pageNumber = Math.ceil(pageNumber) + 1;
			pageNumber = pageNumber - currentPage;
			console.log(pageNumber)
			postModel.paginate({}, { page: pageNumber, limit: 3 }, function(err, results) {
         if(err){
         console.log("error");
         console.log(err);
     } else {
    	var pageSize = results.limit;
    	var pageCount = (results.total)/(results.limit);
    	pageCount = Math.ceil(pageCount);
    	var totalPosts = results.total;

    	res.render('mainPage.ejs', {
    		postModels: results.docs,
    		pageSize: pageSize,
    		pageCount: pageCount,
    		totalPosts: totalPosts,
    		currentPage: currentPage
    	})//res.render
     }//else
     });//paginate


    	})	
	

});

//start the server
app.listen(3000, function(){
	console.log('Its running');
})


// routes ======================================================================
//require('./routes.js')(app); // load our routes and pass in our app