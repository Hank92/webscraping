var request = require('request'),
	cheerio = require('cheerio'),
	fs = require('fs'),
	productInfo = [];

//saving the price and title of the product in an object and injecting into an array

request('https://www.withsellit.com/', function(err, res, body){
	var product = {};
	if(!err && res.statusCode == 200) {
		
		var $ = cheerio.load(body);
		var i = 1;
		$('.odr-small-info').each(function(){		
		var title = $(this).find('.odr-small-title').text();
		var price = $(this).find('.odr-small-price').text();

		product = {
			title: title,
			price: price
		}
	
		productInfo.push(product); // chug in the product object to the images array
			
	});


	for(var i = 0; i < productInfo.length; i++){
		console.log( (i+1) + " -", productInfo[i]);
		}


	}
});
