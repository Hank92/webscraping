var request = require('request'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    urls = [];

request('http://www.reddit.com', function(err, resp, body){
	if(!err && resp.statusCode == 200){
		var $ = cheerio.load(body);
		$('a.title', '#siteTable').each(function(){
			var url = $(this).attr('href');
			if(url.indexOf('i.imgur.com')!= -1){
				urls.push(url);
			}
		});

		console.log(urls.length);
		for(var i = 0; i<urls.length; i++){
			request(urls[i]).pipe(fs.createWriteStream('img/' + i + '.jpg'));
		}
	}
})

//brazilian web scraping
var request = require('request'),
	cheerio = require('cheerio');
	

request({url: 'http://thehackernews.com/', encoding: 'binary'}, function(err, res, body){
	if(!err && res.statusCode == 200) {
		var $ = cheerio.load(body);
		$('blog-posts .hfeed h2 a').each(function(){
		var title = $(this).html();
			console.log(title);


		});
		
var img = $(this).find('img').attr('src');
		var img = $(this).find('div.odr-small-title').html();
	
		
		
	}
});
