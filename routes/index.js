var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

// root route
router.get("/", function(req, res){
	res.render("landing");

});

// =========================
// AUTH ROUTES
// =========================

// show register form
router.get("/register", function(req, res){
	res.render("register", {page: 'register'});
});

// handle sign up logic
router.post("/register", function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	var newUser = new User({username: username});

	// eval(require('locus')); // stops the execution and allows to access the variables in the code --> for instance to check how the new User looks like
	
	// makes user an admin if he enters the right code
	if(req.body.adminCode === 'secretcode123'){
		newUser.isAdmin = true;
	}

	// registers user and stores the username and only the passwords hash and salt value in the DB 
	User.register(newUser, password, function(err, user){
		if (err) {
			req.flash("error", err.message);
			return res.redirect("/register");
		}
		// logs user in with local strategy
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome to YelpCamp " + user.username);
			res.redirect("/campgrounds");
		});
	});
});

// show login form
router.get("/login", function(req, res){
	res.render("login", {page: 'login'});
});

// handle login logic with passport authenticate middleware
router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds", 
		failureRedirect: "/login",
		successFlash: "Welcome back!",
		failureFlash: "Invalid username or password!"
	}), function(req, res){

});

// logout route
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged You Out!");
	res.redirect("/campgrounds");
});

module.exports = router;