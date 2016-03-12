var request = require('request'),
	cheerio = require('cheerio'),
	fs = require('fs'),
	images = [];

request('http://www.bhu.co.kr/', function(err, res, body){
	if(!err && res.statusCode == 200) {
		var $ = cheerio.load(body);
		$('td.arr_new_list').each(function(){
		var img = $(this).find('a font').text();
		
				images.push(img);

		});

		console.log(images.length);
		console.log(images);
		
		
		
	}
});
