var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var geocoder = require("geocoder");


// INDEX - show all campgrounds
router.get("/", function(req, res){
	var noMatch;
	// if user used the search bar and clicked the search button search through db with regex
	if(req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		// Get all campgrounds from DB
		Campground.find({name: regex}, function(err, allCampgrounds){
			if(err){
				console.log(err);
			} else {
				
				if (allCampgrounds.length < 1){
					noMatch = "No campgrounds match that query, please try again.";
				}
				res.render("campgrounds/index", {campgrounds: allCampgrounds, noMatch: noMatch});
			}
		});

	} else {
		// Get all campgrounds from DB
		Campground.find({}, function(err, allCampgrounds){
			if(err){
				console.log(err);
			} else {
				res.render("campgrounds/index", {campgrounds: allCampgrounds, noMatch: noMatch});
			}
		});
	}
	
});

// CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
	// get data from form and add to campgrounds array
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var price = req.body.price;
	var author = {
		id: req.user._id,
		username: req.user.username
	};

	// gets the latitude, longitude and location from the user input
	geocoder.geocode(req.body.location, function (err, data) {
	  if (data && data.results && data.results.length) {
	  	var lat = data.results[0].geometry.location.lat;
  	  	var lng = data.results[0].geometry.location.lng;
  	  	var location = data.results[0].formatted_address;
  	  	var newCampground = {name: name, image: image, description: desc, price: price, author: author, location: location, lat: lat, lng: lng};
	  }
  	  
  	  // Create a new campground and save to DB
  	  Campground.create(newCampground, function(err, newlyCreated){
  	      if(err){
  	        req.flash("error", "Campground couldn't be created try again later");
			res.redirect("/campgrounds");
  	      } else {
  	        req.flash("success", "Campground successfuly created");
			// redirect back to campgrounds page
			res.redirect("/campgrounds");
  	      }
  	  });
  	});
});

// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});

// SHOW - shows more info about a specific campground
router.get("/:id", function(req, res){
	// find the campground with provided ID and fills the comments array with the actual comment objects not the id's
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error", "Campground not found");
			res.redirect("back");
		} else {
			// render show template with that campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		res.render("campgrounds/edit", {campground: foundCampground});		
	});
});


// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var price = req.body.price;

	geocoder.geocode(req.body.location, function (err, data) {
	  if (data && data.results && data.results.length) {
	  	var lat = data.results[0].geometry.location.lat;
  	  	var lng = data.results[0].geometry.location.lng;
  	  	var location = data.results[0].formatted_address;
  	  	var newData = {name: name, image: image, description: desc, price: price, location: location, lat: lat, lng: lng};
	  }
  	  
  	  
  	  var campgroundId = req.params.id;
  	  // find and update the correct campground
  	  Campground.findByIdAndUpdate(campgroundId, {$set: newData}, function(err, updatedCampground){
  	      if(err){
  	          req.flash("error", "Campground couldn't be updated. Try again later.");
  	          res.redirect("back");
  	      } else {
  	          req.flash("success", "Campground successfully updated");
  	          res.redirect("/campgrounds/" + campgroundId);
  	      }
  	  });
  	});
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if (err) {
			req.flash("error", "Campground couldn't be deleted try again later.");
			res.redirect("/campgrounds");
		} else {
			req.flash("success", "Campground successfully deleted");
			res.redirect("/campgrounds");
		}
	});
});

// source: https://stackoverflow.com/questions/38421664/fuzzy-searching-with-mongodb
function escapeRegex(text){
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// exporting router 
module.exports = router;