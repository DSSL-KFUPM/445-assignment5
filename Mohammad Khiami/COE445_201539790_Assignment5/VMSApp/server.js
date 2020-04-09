var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var fs = require('fs');
const path = require('path');
var fileName = "./visits.json";
var file = require(fileName);
var methodOverride = require('method-override');

var passport = require('passport');
var LocalStrategy = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose')
var User = require('./model/user')

const DATABASE_NAME = 'COE445';
const DATABASE_URL = 'mongodb://localhost:27017/COE445'

var mongoose = require('mongoose')
mongoose.connect(DATABASE_URL);

var visitSchema = new mongoose.Schema({
	host: String,
	name: String,
	date: String,
	time: String,
	destination: String,
	car_make: String,
	car_model : String,
	plate_number: String,
	checked_out: String,
	visit_number: String
})

var Visit = mongoose.model("Visit", visitSchema);


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(require('express-session')({
	secret:"Use any message here",
	resave : false,
	saveUninitialized:false
}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.listen(3000, () => {
  console.log('Server is running');
});

//RESTful routes

app.get('/register',function(req,res){
	res.render('register.ejs');
})

app.post('/register',function(req,res){
	var us = {"username":req.body.username, "role":req.body.selectpicker};
	User.register(new User(us), req.body.password, function(err,user){
		if(err) {
			console.log(err)
			return res.render('register')
		}
		passport.authenticate("lcoal")(req,res,function(){
			res.redirect("/login");
		})
	})
})

app.get('/login', function(req,res){
	res.render('login.ejs');
})

app.post('/login', passport.authenticate("local", {
	successRedirect: '/main',
	failureRedirect: '/login'
}) ,function(req,res){
	
})

app.get('/logout', function(req,res){
	req.logout();
	res.redirect('/')
})

app.get('/fastCheck', function(req,res){
	res.render('fastCheck.ejs');
})

app.post('/fastCheck',function(req,res){
	var optionSelected = req.body.optionSelected;
	if(optionSelected == "Retrieve Information") {
		var visit_number = req.body.visitNumber;
		var cvisit = {};
		Visit.findOne({visit_number:visit_number}, function(err, result){
			if(result) {
				cvisit.name = result.name;
				cvisit.host = result.host;
				cvisit.date = result.date;
				cvisit.time = result.time;
				cvisit.destination = result.destination;
				cvisit.car_make = result.car_make;
				cvisit.car_model = result.car_model;
				cvisit.plate_number = result.plate_number;
				console.log("Checked out:");
				var x = result.checked_out;
				if(x == "Yes") {
					cvisit.stat = "Outside";
				} else {
					cvisit.stat = "Inside";
				}
				res.render("showVisitByNumber.ejs",{cvisit:cvisit});
			}
			else {
				res.render("displayError.ejs", {visitNumber:visit_number});
			}
		});	
	} else {
		console.log("Higher");
		var visit_number = req.body.visitNumber;
		console.log(visit_number);
		Visit.findOne({visit_number:visit_number}, function(err, result){
			if(result) {
				if(result.checked_out == "Yes") {
					console.log("Yes");
					//Visit.updateOne({visit_number: visit_number},{ $set: {checked_out: "No"}},false,true);
					var myquery = {visit_number: visit_number };
					var newvalues = { $set: {checked_out: "No" } };
					Visit.updateOne(myquery, newvalues, function(err, res) {
					if (err) throw err;
						console.log("1 document updated");
					});
					res.redirect('/');
				}
				else {
					console.log("No");
					//Visit.update({visit_number: visit_number},{ $set:{checked_out: "Yes"}},false,true);
					var myquery = {visit_number: visit_number };
					var newvalues = { $set: {checked_out: "Yes" } };
					Visit.updateOne(myquery, newvalues, function(err, res) {
					if (err) throw err;
						console.log("1 document updated");
					});
					res.redirect('/');
				}	
			}
			else {
				res.render("displayError.ejs", {visitNumber:visit_number});
			}
		});	
	}
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}

//function isLoggedIn(req,res,next){
//	console.log('Checking before deciding')
//	if (req.isAuthenticated()) {
//		console.log('Yes')
//		return next()
//	}
//	res.redirect('/login')
//}

app.get("/",function(req,res){
	res.sendFile("public/index.html");
});

//app.get("/visitors",function(req,res){
//	res.sendFile(path.join(__dirname+'/visitors.html'))
//});

//app.get("/resident",function(req,res){
//	res.sendFile(path.join(__dirname+'/residents.html'))
//});

app.get("/security",function(req,res){
	res.sendFile(path.join(__dirname+'/security.html'))
});

app.get("/main",function(req,res){
	res.sendFile(path.join(__dirname+'/main.html'))
});

app.get("/visits.json",function(req,res){
	console.log("sending out JSON file");
 	res.sendFile(path.join(__dirname+'/visits.json'));
});

app.get("/visits/new", function(req,res){
	res.render("new.ejs");
});

// OK
app.post("/visits", function(req,res){
	var visitor = req.body.visitorInput;
	var host = req.body.hostInput;
	var date = req.body.dateInput;
	var time = req.body.timeInput;
	var destination = req.body.destinationInput;
	var make = req.body.makeInput;
	var model = req.body.modelInput;
	var plate = req.body.plateInput;
	visitNumber = Math.floor(Math.random() * (999999 - 100000) + 100000);
	if(visitor != undefined && host != undefined && date != undefined && time != undefined && destination != undefined && make !=undefined && model != undefined && plate !=undefined){
		var newVisit = new Visit({
			host: host,
			name: visitor,
			date: date,
			time: time,
			destination: destination,
			car_make: make,
			car_model : model,
			plate_number: plate,
			checked_out: "No",
			visit_number: visitNumber,
		});
		
		newVisit.save(function (err, visit) {
			if (err) return console.error(err);
			console.log(visit.name + " saved to visits collection.");
		});
	}
	
	
	res.render("displayNewVisitNumber.ejs", {visitNumber:visitNumber});
	//res.redirect("/visits");
});

// OK
app.delete("/visits/:name", function(req,res){
	var name = req.params.name;
	Visit.deleteOne({name:name},function(err,result){
		if(err) console.log(err)
	});	
	res.redirect("/visits");
});

// OK
app.get("/visits", isLoggedIn, function(req,res,next){
	Visit.find({},function(err, visits){
		if(err) console.log(err);
		else{
			// res.send(students)
			res.render("visits.ejs", {visits:visits});
		}
	})
});


app.put("/visits/:name",function(req,res){
	var visitor = req.params.name;
	var host = req.body.hostInput;
	var date = req.body.dateInput;
	var time = req.body.timeInput;
	var destination = req.body.destinationInput;
	var make = req.body.makeInput;
	var model = req.body.modelInput;
	var plate = req.body.plateInput;
	Visit.findOne({name:visitor}, function(err, result){
		console.log("Hi this is");
		console.log(result._id);
		//Visit.update({_id: result._id},{$set :{"host" : host, "name" : visitor, "date" : date, "time" : time, "destination" : destination, "car_make" : make, "car_model" : model, "plate_number" : plate}});
		var myquery = {name:visitor };
		var newvalues = {$set :{"host" : host, "name" : visitor, "date" : date, "time" : time, "destination" : destination, "car_make" : make, "car_model" : model, "plate_number" : plate}};
		Visit.updateOne(myquery, newvalues, function(err, res) {
		if (err) throw err;
			console.log("1 document updated");
		});
		res.redirect("/visits");
	});
	

	
});

//OK
app.get("/visits/:name/edit", function(req,res){
	var name = req.params.name;
	var cvisit = {};
	cvisit.name = name;
	Visit.findOne({name:name}, function(err, result){
		console.log(result);
		cvisit.host = result.host;
		cvisit.date = result.date;
		cvisit.time = result.time;
		cvisit.destination = result.destination;
		cvisit.car_make = result.car_make;
		cvisit.car_model = result.car_model;
		cvisit.plate_number = result.plate_number;
		res.render("edit.ejs",{cvisit:cvisit});
	});	
});

// OK
app.get("/visits/:name", function(req,res){
	var name = req.params.name;
	var visitHistory = [];
	Visit.find({name: name}).then((visits) => {
		visits.forEach((visit) => {
			var cvisit = {};
			cvisit.host = visit.host;
			cvisit.date = visit.date;
			cvisit.time = visit.time;
			cvisit.destination = visit.destination;
			cvisit.car_make = visit.car_make;
			cvisit.car_model = visit.car_model;
			cvisit.plate_number = visit.plate_number;
			visitHistory.push(cvisit);
			console.log(visitHistory);
		});
		res.render("show.ejs", {name:name, visitHistory:visitHistory});
	});			
});

// Residents

app.get("/residents/new", function(req,res){
	res.render("new.ejs");
});

// OK
app.post("/residents", function(req,res){
	var visitor = req.body.visitorInput;
	var host = req.body.hostInput;
	var date = req.body.dateInput;
	var time = req.body.timeInput;
	var destination = req.body.destinationInput;
	var make = req.body.makeInput;
	var model = req.body.modelInput;
	var plate = req.body.plateInput;
	if(visitor != undefined && host != undefined && date != undefined && time != undefined && destination != undefined && make !=undefined && model != undefined && plate !=undefined){
		var newVisit = new Visit({
			host: host,
			name: visitor,
			date: date,
			time: time,
			destination: destination,
			car_make: make,
			car_model : model,
			plate_number: plate,
			checked_out: "No",
		});
		
		newVisit.save(function (err, visit) {
			if (err) return console.error(err);
			console.log(visit.name + " saved to visits collection.");
		});
	}
	res.redirect("/residents");
});

//OK
app.delete("/residents/:host", function(req,res){
	var host = req.params.host;
	Visit.deleteOne({host:host},function(err,result){
		if(err) console.log(err)
	});	
	res.redirect("/residents");
});

// OK
app.get("/residents", isLoggedIn, function(req,res,next){
	Visit.find({},function(err, visits){
		if(err) console.log(err);
		else{
			res.render("residents.ejs", {visits:visits});
		}
	})
});


app.put("/residents/:host",function(req,res){
	var host = req.params.host;
	var visitor = req.body.visitorInput;
	var date = req.body.dateInput;
	var time = req.body.timeInput;
	var destination = req.body.destinationInput;
	var make = req.body.makeInput;
	var model = req.body.modelInput;
	var plate = req.body.plateInput;
	Visit.findOne({host:host}, function(err, result){
		//Visit.update({_id: result._id},{$set :{"host" : host, "name" : visitor, "date" : date, "time" : time, "destination" : destination, "car_make" : make, "car_model" : model, "plate_number" : plate}});
		var myquery = {host:host };
		var newvalues = {$set :{"host" : host, "name" : visitor, "date" : date, "time" : time, "destination" : destination, "car_make" : make, "car_model" : model, "plate_number" : plate}};
		Visit.updateOne(myquery, newvalues, function(err, res) {
		if (err) throw err;
			console.log("1 document updated");
		});
		res.redirect("/residents");	
		});
});




app.get("/residents/:host/edit", function(req,res){
	var host = req.params.host;
	var cvisit = {};
	cvisit.host = host;
	Visit.findOne({host:host}, function(err, result){
		console.log(result);
		cvisit.name = result.name;
		cvisit.date = result.date;
		cvisit.time = result.time;
		cvisit.destination = result.destination;
		cvisit.car_make = result.car_make;
		cvisit.car_model = result.car_model;
		cvisit.plate_number = result.plate_number;
		res.render("edit.ejs",{cvisit:cvisit});
	});	
});

app.get("/residents/:host", function(req,res){
	var name = req.params.host;		
	var visitHistory = [];
	Visit.find({host: name}).then((visits) => {
		visits.forEach((visit) => {
			var cvisit = {};
			cvisit.name = visit.name;
			cvisit.date = visit.date;
			cvisit.time = visit.time;
			cvisit.destination = visit.destination;
			cvisit.car_make = visit.car_make;
			cvisit.car_model = visit.car_model;
			cvisit.plate_number = visit.plate_number;
			visitHistory.push(cvisit);
			console.log(visitHistory);
		});
		res.render("show.ejs", {name:name, visitHistory:visitHistory});
	});	
});