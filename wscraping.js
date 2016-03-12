var request = require('request'),
	cheerio = require('cheerio'),
	fs = require('fs'),
	images = [];

request('https://www.withsellit.com/', function(err, res, body){
	if(!err && res.statusCode == 200) {
		var $ = cheerio.load(body);
		$('.odr-small-image img').each(function(){
		var img = $(this).attr('src');

				images.push(img);;	
		

		});

		console.log(images);
		console.log(images.length);
		for(var i = 0;  i < images.length; i++){
			request(images[i]).pipe(fs.createWriteStream('images/sell' + i + '.jpg'));	
		}

	
	}
});
