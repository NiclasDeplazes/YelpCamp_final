var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
	name: String,
	image: String,
	description: String,
	price: String,
	location: String,
	lat: Number,
	lng: Number,
	createdAt: { type: Date, default: Date.now },
	author: {
		id: {
			// reference to Usermodel
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"

		},
		username: String
	}, 
	// Array of comments id's (references)
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]

});

module.exports = mongoose.model("Campground", campgroundSchema);