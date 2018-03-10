var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");

var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds");

// requiring routes
var commentRoutes    = require("./routes/comments"),
	campgroundRoutes = require("./routes/campgrounds"),
	indexRoutes       = require("./routes/index");

// connecting to db (mongod has to run in local environment)
// adding a local variable (local: export VARIABLENAME=...  , heroku: heroku config:set VARIABLENAME=... )
mongoose.connect(process.env.DATABASEURL);



app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
// __dirname is the path of the app.js
app.use(express.static(__dirname + "/public"));
// tells the app that whenever it gets a request that has _method as a parameter, 
// that it should treat that request as the paramater method(PUT, DELETE etc.)
app.use(methodOverride("_method"));
// setting up flash messages
app.use(flash());
// fills DB with seed data
// seedDB();

// adding moment.js object to the locals
app.locals.moment = require('moment');

// PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "Hockey is the greatest sport of the world",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
// these three methods come with passport-local-mongoose package of the user model
passport.use(new LocalStrategy(User.authenticate()));
// encoding, serializing the session-data and putting it back into the session
passport.serializeUser(User.serializeUser());
// picking the data from the session thats encoded and unencoding it
passport.deserializeUser(User.deserializeUser());

// middleware that makes the user object and the flash messages accessable in every route (with app.use)
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

// tells the app to use the different routes
// /... gets appended to the front of all url's of the routes in the specific file
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);



// starting server (local on port 3000 or horoku)
app.listen(process.env.PORT, process.env.IP, function(){
	console.log("YelpCamp Server started");
});