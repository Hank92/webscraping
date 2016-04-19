// app/routes.js

var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var	methodOverride = require('method-override');


var postModel = require('../app/models/post');
var incheonPost = require('../app/models/incheonAirportPost');

module.exports = function (app, passport){

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

app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

 app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

// process the signup form
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

// process the login form
app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

app.get('/posts/:id', function(req, res){
	var postId = req.postId;
	postId.userComments.push({ userPost: req.query.userPost});
	postId.save();
	res.render('individualHumor_Board.ejs', {postModel: postId});
	console.log(postId)//finds the matching object
});

app.delete('/incheonAirportPolice/:id', isLoggedInIncheonAirport, function(req, res){
   incheonPost.findById(req.params.id, function(err, airportPost){
   		if(err) return res.json({suceess: false, message:err});
   			if((req.user.local.email)!==(airportPost.nickname)) return res.json({success:false, message: "게시글 생성자가 아닙니다"})
   			incheonPost.remove({_id: req.params.id}, function(err) {
		if (err) res.json(err);
		else     res.redirect('/incheonAirportPolice')
			})//incheonPost.remove
   		
   })
	
})
//post a comment on humor board
app.post('/posts/:id', isLoggedInToPost, function (req, res){
	postModel.find({_id: req.params.id}, function(err, item){
		if(err) return next("error finding blog post.");
		item[0].userComments.push({userPost : req.body.userPost})
		item[0].save(function(err, data){
			if (err) res.send(err)
			else res.redirect('/posts/' + req.params.id)
		});
	})

}) //app.post  

app.post('/incheonAirportPolice',  function (req, res){
	var newIncheonAirportPost = new incheonPost ({
		nickname: req.body.nickname,
		text: req.body.text,
		password: req.body.password
		
	});
	newIncheonAirportPost.save(function(err){
		if(err){
			console.log("error!")
			res.send(err)
		}
		else{
			res.redirect('/incheonAirportPolice')
		}
	});
});

app.get('/', function (req, res){
	res.render('main.ejs');
});

app.get('/trafficSixCamp', function (req, res){
	res.render('trafficSixCamp.ejs');
});

app.get('/incheonAirportPolice', isLoggedInIncheonAirport, function (req, res){
	var currentPage = 1;
	if (typeof req.query.page !== 'undefined') {
        currentPage = +req.query.page;
    	}
		incheonPost.paginate({}, {sort: {"_id":-1}, page: currentPage, limit: 5 }, function(err, results) {
         if(err){
         console.log("error");
         console.log(err);
     } else {
    	    pageSize = results.limit;
            pageCount = (results.total)/(results.limit);
    		pageCount = Math.ceil(pageCount);
    	    totalPosts = results.total;
    	console.log(results.docs)
    	res.render('incheonAirportPolice.ejs', {  
    		user: req.user,  	
    		incheonPosts: results.docs,
    		pageSize: pageSize,
    		pageCount: pageCount,
    		totalPosts: totalPosts,
    		currentPage: currentPage
    	})//res.render
    	console.log(req.user)
     }//else
     });//paginate
	
});


app.get('/posts', function (req, res){
	var currentPage = 1;
	if (typeof req.query.page !== 'undefined') {
        currentPage = +req.query.page;
    	}
			postModel.paginate({}, {sort: {"_id":-1}, page: currentPage, limit: 10 }, function(err, results) {
         if(err){
         console.log("error");
         console.log(err);
     } else {
    	    pageSize = results.limit;
            pageCount = (results.total)/(results.limit);
    		pageCount = Math.ceil(pageCount);
    	    totalPosts = results.total;
    	console.log(results.docs)

    	res.render('humor_board.ejs', {
    		postModels: results.docs,
    		pageSize: pageSize,
    		pageCount: pageCount,
    		totalPosts: totalPosts,
    		currentPage: currentPage
    	})//res.render
     }//else
     });//paginate
	
});
};


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

					comments.splice(0,1)

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

// route middleware to make sure a user is logged in to post on humor board
function isLoggedInToPost(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/posts/' + req.params.id);
}

// route middleware to make sure a user is logged in
function isLoggedInIncheonAirport(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}