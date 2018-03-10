var express = require("express");
// mergeParams is needed to access the id parameter of the urls
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// Comments new
router.get("/new", middleware.isLoggedIn, function(req, res){
	// find campground by id
	Campground.findById(req.params.id, function(err, campground){
		if (err) {
			console.log(err);
		} else {
			res.render("comments/new", {campground: campground});
		}
	});
});

// Comments create
router.post("/", middleware.isLoggedIn, function(req, res){
	// lookup campground using id
	Campground.findById(req.params.id, function(err, campground){
		if (err) {
			req.flash("error", "Campground couldn't be found");
			res.redirect("/campgrounds");
		} else {
			// create new comment
			Comment.create(req.body.comment, function(err, comment){
				if (err) {
					req.flash("error", "Comment couldn't be created. Try again later.");
				} else {
					// add username and id to comment 
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					// save to comment
					comment.save();
					// connect new comment to campground
					campground.comments.push(comment._id);
					campground.save();
					req.flash("success", "Comment successfully added");
					// redirect too campground show page
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error", "Campground not found");
			return res.redirect("back");
		}
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if (err) {
				res.redirect("back");
			} else {
				var campgroundId = req.params.id;
				res.render("comments/edit", {campground_id: campgroundId, comment: foundComment});
			}
		});
	});

	
	
});

// COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	var campgroundId = req.params.id;
	var commentId = req.params.comment_id;
	var commentData = req.body.comment;
	Comment.findByIdAndUpdate(commentId, commentData, function(err, updatedComment){
		if (err) {
			res.redirect("back");
		} else {
			req.flash("success", "Comment successfully updated");
			res.redirect("/campgrounds/" + campgroundId);
		}
	});
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if (err) {
			res.redirect("back");
		} else {
			req.flash("success", "Comment successfully removed");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

module.exports = router;