// app/models/post.js
var mongoose = require('mongoose');

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
     module.exports = mongoose.model('Post', postSchema);