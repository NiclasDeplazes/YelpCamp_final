var Campground = require("../models/campground");
var Comment = require("../models/comment");
// all the middleware goes here
var middlewareObj = {};

// middleware to check if the user has permission to edit or delete the campground, because he has created it
middlewareObj.checkCampgroundOwnership = function(req, res, next){
	// is user logged in?
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, function(err, foundCampground){
			if(err || !foundCampground){
				req.flash("error", "Campground not found");
				res.redirect("back");
			} else {
				// does user own the comment or his he an admin?
				if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
					next();

				} else {
					req.flash("error", "You don't have permission to do that");
					res.redirect("back");
				}
				
			}
		});

	} else {
		req.flash("error", "You need to be logged in to do that");
		// takes user back to where he came from
		res.redirect("back");
	}
}


// middleware to check if the user has permission to edit or delete the comment, because he has created it
middlewareObj.checkCommentOwnership = function(req, res, next){
	// is user logged in?
	if(req.isAuthenticated()){

		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err || !foundComment){
				req.flash("error", "Comment not found");
				res.redirect("back");
			} else {
				// does user own the comment or his he an admin?
				if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
					next();

				} else {
					req.flash("error", "You don't have permission do do that");
					res.redirect("back");
				}
				
			}
		});

	} else {
		req.flash("error", "You need to be logged in to do that");
		// takes user back to where he came from
		res.redirect("back");
	}
}
// middelware to check if the user is logged in
middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	// flash will show up only on the next page
	req.flash("error", "You need to be logged in to do that");
	res.redirect("/login");
}

module.exports = middlewareObj;