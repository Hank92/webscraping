var request = require('request'),
	cheerio = require('cheerio'),
	fs = require('fs'),
	newposts = [];

request('http://www.bhu.co.kr/', function(err, res, body){

	if(!err && res.statusCode == 200) {
		var $ = cheerio.load(body);
		$('td.arr_new_list').each(function(){
		var post = $(this).find('a font').text();
		var href = $(this).find('a').attr('href')
				newposts.push(post);
				console.log("bhu.co.kr"+ href);
		});

		console.log(newposts.length);

		for(var i =0; i<newposts.length; i++){
			console.log( (i+1) + '.' + newposts[i]);	
		}
		
	}
});