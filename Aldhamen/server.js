var express = require("express");
var app = express();
var methodOverride = require('method-override');
const DATABASE_URL = 'mongodb://localhost:27017/COE445';
const bcrypt = require('bcrypt');
const saltRounds = 10;
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var nodemailer = require('nodemailer');
app.use(express.static("public"));
app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(cookieParser());
mongoose.connect(DATABASE_URL);

var visitsSchema = new mongoose.Schema({
	host: String,
	name: String,
	date: String,
	destination: String,
	car_make: String,
	car_model: String,
	plate_number: String,
	checked_out: String,
	check_number:String
}, {versionKey:false});
var usersSchema = new mongoose.Schema({
	name: String,
	email: String,
	password: String,
	role: String,
	salt: String
},{versionKey:false});


var Visitor = mongoose.model("visit_request", visitsSchema);
var User = mongoose.model("users", usersSchema);
var verified = [{cookies:String, email:String, username:String, role:String}];

app.listen(3000,function(){
	console.log("Server is running");
});

//RESTful routes
app.get("/", function(req,res){
	if(checkVerify(req.sessionID) == true){
		res.redirect('/visits/');
	}
	else{
	res.redirect("/Welcome");
	}
});
//Landing page
app.get("/Welcome", function(req,res){
	if(checkVerify(req.sessionID) == true){
		res.redirect('/visits/');
	}
	else{
	res.render("landingPage.ejs");
	}
});
//Login page
app.get("/login",  function(req,res){
	if(checkVerify(req.sessionID) == true){
		res.redirect('/visits/');
	}
	else{
		res.render("login.ejs");
	}
});
//Register page
app.get("/register", function(req,res){
	if(checkVerify(req.sessionID) == true){
		res.redirect('/visits/');
	}
	else{
		res.render("register.ejs");
	}
});
//New visit page
app.get("/visits/new", function(req,res){
	if(checkVerify(req.sessionID) == true){
		if(getRole(req.sessionID) == "Visitor"){
			 var visitorName = getUser(req.sessionID);
			 var visitorReadOnly = "readonly";}
		else if(getRole(req.sessionID) == "Resident"){
			var hostName = getUser(req.sessionID);
			var hostReadOnly = "readonly";}
		res.render("new.ejs", {visitorName:visitorName, hostName:hostName, visitorReadOnly:visitorReadOnly, hostReadOnly:hostReadOnly});
	}
	else{
		res.status(500).send("Must be logged in to access this page!");
	}
});
//New visit request
app.post("/visits", function(req,res){
	var host = req.body.host;
	var name = req.body.name;
	
	start: var random = Math.floor(1000 + (9999 - 1000) * Math.random());
	Visitor.findOne({check_number:random}, function(err, result){
		if(result != null){
			start;
		}
	});
	random = random.toString();
	var newVisitor = new Visitor({
		host : host,
		name : name,
		date: req.body.date,
		destination: req.body.destination,
		car_make: req.body.car_make,
		car_model: req.body.car_model,
		plate_number: req.body.plate_number,
		check_number:random,
		checked_out: "NO"
	});

	Visitor.find({host:host, name:name}, function(err,visits){
		if(err) console.log(err);
		else{
			if(visits.length == 0){
				newVisitor.save(function(err, visit){
					if(err) console.log(err);
				});
			}
		}
	});
	res.redirect("/visits/");
});
//Delete visit page
app.delete("/visits/:name/:host", function(req,res){
	if(checkVerify(req.sessionID) == true){
		var name = req.params.name;
		var host = req.params.host;
		Visitor.deleteOne({name:name, host:host},function(err,result){
			if(err) console.log(err)
		});
		res.redirect("/visits/");
	}
	else{
		res.status(500).send("Must be logged in to access this page!");
	}

	});
//All visits page
app.get("/visits/", function(req,res){
	if(checkVerify(req.sessionID) != true){
		res.status(500).send("Must be logged in to access this page!");
	}
	else{
		if(getRole(req.sessionID) == "Security Office"){
			Visitor.find({},function(err, visits){
				if(err) console.log(err);
				else{
					res.render("visits.ejs",{visits:visits, role:"Security Office"});
				}
			});
		}
		else if(getRole(req.sessionID) == "Visitor"){
			Visitor.find({name:getUser(req.sessionID)},function(err, visits){
				if(err) console.log(err);
				else{
					res.render("visits.ejs",{visits:visits, role:"Visitor"});
				}
			});
		}
		else{
			Visitor.find({host:getUser(req.sessionID)},function(err, visits){
				if(err) console.log(err);
				else{
					res.render("visits.ejs",{visits:visits, role:"Resident"});
				}
			});
		}
	}
});	
//Update visit request
app.patch("/visits/:name/:host",function(req,res){
	var origName = req.params.name;
	var origHost = req.params.host;
	var name = req.body.name;
	var host = req.body.host;
	var date = req.body.date;
	var destination = req.body.destination;
	var car_make = req.body.car_make;
	var car_model = req.body.car_model;
	var plate_number = req.body.plate_number;
	Visitor.updateOne({name:origName, host:origHost}, {$set :{name:name, host:host, date:date, destination:destination, car_make:car_make, car_model:car_model, plate_number:plate_number}},function(err, res){});
	res.redirect("/visits/");
});
//Edit visit page
app.get("/visits/:name/:host/edit", function(req,res){
	if(checkVerify(req.sessionID) == true){
		var name = req.params.name;
		var host = req.params.host;
		if(getRole(req.sessionID) == "Visitor"){
			if(name == getUser(req.sessionID)){
				var visitorReadOnly = "readonly";
				Visitor.findOne({name:name, host:host}, function(err,result){
					if(err) console.log(err);
					else{
						res.render("edit.ejs",{name:result.name, host:result.host, date:result.date, destination:result.destination, car_make:result.car_make, car_model:result.car_model, plate_number:result.plate_number, visitorReadOnly:visitorReadOnly, hostReadOnly:hostReadOnly});
					}
				})
			}
		}
		else if (getRole(req.sessionID) == "Resident"){
			if(host == getUser(req.sessionID)){
				var hostReadOnly = "readonly";
				Visitor.findOne({name:name, host:host}, function(err,result){
					if(err) console.log(err);
					else{
						res.render("edit.ejs",{name:result.name, host:result.host, date:result.date, destination:result.destination, car_make:result.car_make, car_model:result.car_model, plate_number:result.plate_number, visitorReadOnly:visitorReadOnly, hostReadOnly:hostReadOnly});
					}
				})
			}
		}
		else{
			Visitor.findOne({name:name, host:host}, function(err,result){
				if(err) console.log(err);
				else{
					res.render("edit.ejs",{name:result.name, host:result.host, date:result.date, destination:result.destination, car_make:result.car_make, car_model:result.car_model, plate_number:result.plate_number, visitorReadOnly:visitorReadOnly, hostReadOnly:hostReadOnly});
				}
			});
		}
	}	
	else{
		res.status(500).send("Must be logged in to access this page!");
	}
});
//Show visit details page
app.get("/visits/:name/:host", function(req,res){
	if(checkVerify(req.sessionID) == true){
		var name = req.params.name;
		var host = req.params.host;
		if(getRole(req.sessionID) == "Resident"){
			if(getUser(req.sessionID) == host){
				Visitor.findOne({name:name, host:host}, function(err,result){
					if(err) console.log(err);
					else{
						res.render("show.ejs", {name:result.name, host:result.host, date:result.date, destination:result.destination, car_make:result.car_make, car_model:result.car_model, plate_number:result.plate_number, checked_out:result.checked_out, check_number:result.check_number, access:false});
					}
				});
			}
		}
		else if(getRole(req.sessionID) == "Visitor"){
			if(getUser(req.sessionID) == name){
				Visitor.findOne({name:name, host:host}, function(err,result){
					if(err) console.log(err);
					else{
						res.render("show.ejs", {name:result.name, host:result.host, date:result.date, destination:result.destination, car_make:result.car_make, car_model:result.car_model, plate_number:result.plate_number, checked_out:result.checked_out, check_number:result.check_number, access:false});
					}
				});
			}
		}
		else{
			Visitor.findOne({name:name, host:host}, function(err,result){
				if(err) console.log(err);
				else{
					res.render("show.ejs", {name:result.name, host:result.host, date:result.date, destination:result.destination, car_make:result.car_make, car_model:result.car_model, plate_number:result.plate_number, checked_out:result.checked_out, check_number:result.check_number, access:true});
				}
			});
		}
	}
});
//Register request
app.post('/register', function(req, res) {
	var password = req.body.password;
	var name = req.body.name;
	var email = req.body.email;
	email = email.toLowerCase();
	var role = req.body.role;
	bcrypt.genSalt(saltRounds, function(err, salt){
		bcrypt.hash(password, salt, function(err, hash){
			User.find({email:email}, function(err,users){
				if(users.length == 0){
					var newUser = new User({
						name:name,
						email:email,
						password:hash,
						role:role,
						salt:salt
					});
					newUser.save(function(err,result){
					});
					verified.push({cookies:req.sessionID, email:email, username:name, role:role});
					res.redirect("/visits");
				}
				else {
					res.status(500).send("User Already Exist!");
				}	
			});
		});
	});
});
//Login request
app.post('/login', function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	email = email.toLowerCase();
	User.findOne({email:email}, function(err,users){
		if(users == null){
			res.status(500).send("User Does Not Exist!");
		}
		else {
			if(checkVerify(req.sessionID) == true){
				res.redirect('/');
			}
			else{
				bcrypt.hash(password, users.salt, function(err, hash){
					if(users.password == hash){
						verified.push({cookies:req.sessionID, email:users.email, username:users.name, role:users.role});
						res.redirect("/visits/");
					}
					else {
						res.status(500).send("Wrong Password!");
					}
				});
			}
		}
	});
});
//Check in form
app.get('/visits/check', function(req, res) {
	if(checkVerify(req.sessionID) == false){
		res.redirect('/');
	}
	else{
		if(getRole(req.sessionID) == "Resident"){
			res.send(500, 'Residents cannot check in!');
		}
		else{
			res.render("check.ejs");
		}
	}
});
//Check in request
app.patch('/visits/check', function(req, res) {
	var check_number = req.body.check_number;
	Visitor.findOne({check_number:check_number}, function(err, result){
		if(err) console.log(err);
		if(result != null){
			if(getRole(req.sessionID) == "Visitor"){
				if(result.checked_out == "NO"){
					Visitor.updateOne({name:result.name, host:result.host}, {$set :{checked_out:"YES"}},function(err, res){});
					var str = "/visits/" + result.name.replace(" ","%20") + "/" + result.host.replace(" ","%20");
					nodemailer.createTestAccount((err, account) => {
						if (err) console.log(err);
						const transporter = nodemailer.createTransport({
							host: account.smtp.host,
							port: account.smtp.port,
							secure: account.smtp.secure,
							auth: {
							user: account.user,
							pass: account.pass
							}
						});
						User.findOne({name:result.host}, function(err, users){
							if(users != null){
								const message = {
								from: "Admin <admin@hotmail.com>",
								to: users.email,
								subject: "Visitor Notification",
								text: "Visitor has checked out"
								};
								transporter.sendMail(message, (err, info) => {
									if (err) console.log("Error occurred. " + err.message);
									console.log("Message sent: %s", info.response);
									console.log("Message sent: %s", message);
									});
							}
							else{
								console.log("Host isn't registered");
							}
						});
					});
					res.redirect(str);
				}
				else{
					Visitor.updateOne({name:result.name, host:result.host}, {$set :{checked_out:"NO"}},function(err, res){});
					var str = "/visits/" + result.name.replace(" ","%20") + "/" + result.host.replace(" ","%20");
					nodemailer.createTestAccount((err, account) => {
						if (err) console.log(err);
						const transporter = nodemailer.createTransport({
						host: account.smtp.host,
						port: account.smtp.port,
						secure: account.smtp.secure,
						auth: {
							user: account.user,
							pass: account.pass
						}
						});
						User.findOne({name:result.host}, function(err, users){
							if(users != null){
								const message = {
								from: "Admin <admin@hotmail.com>",
								to: users.email,
								subject: "Visitor Notification",
								text: "Visitor has checked in"
								};
								transporter.sendMail(message, (err, info) => {
									if (err) console.log("Error occurred. " + err.message);
									console.log("Message sent: %s", info.response);
									console.log("Message sent: %s", message);
								});
							}
							else{
								console.log("Host isn't registered");
							}
						});
					});
					res.redirect(str);
				}
			}
			else{
				var str = "/visits/" + result.name.replace(" ","%20") + "/" + result.host.replace(" ","%20");
				res.redirect(str);
			}
		}
		else{
			res.status(500).send("No request has this check in/out number");
		}
	});
});
//Check in request (Security Office)
app.post('/checks/:check_number', function(req, res) {
	var check_number = req.params.check_number;
	Visitor.findOne({check_number:check_number}, function(err, result){
		if(err) console.log(err);
		if(result.checked_out == "NO"){
			Visitor.updateOne({name:result.name, host:result.host}, {$set :{checked_out:"YES"}},function(err, res){});
			var str = "/visits/" + result.name.replace(" ","%20") + "/" + result.host.replace(" ","%20");
			nodemailer.createTestAccount((err, account) => {
				if (err) console.log(err);
				const transporter = nodemailer.createTransport({
				  host: account.smtp.host,
				  port: account.smtp.port,
				  secure: account.smtp.secure,
				  auth: {
					user: account.user,
					pass: account.pass
				  }
				});
				User.findOne({name:result.host}, function(err, users){
					if(users != null){
						const message = {
						from: "Admin <admin@hotmail.com>",
						to: users.email,
						subject: "Visitor Notification",
						text: "Visitor has checked out"
						};
						transporter.sendMail(message, (err, info) => {
							if (err) console.log("Error occurred. " + err.message);
							console.log("Message sent: %s", info.response);
							console.log("Message sent: %s", message);
						  });
					}
					else{
						console.log("Host isn't registered");
					}
				});
			});
			res.redirect(str);
		}
		else{
			Visitor.updateOne({name:result.name, host:result.host}, {$set :{checked_out:"NO"}},function(err, res){});
			var str = "/visits/" + result.name.replace(" ","%20") + "/" + result.host.replace(" ","%20");
			nodemailer.createTestAccount((err, account) => {
				if (err) console.log(err);
				const transporter = nodemailer.createTransport({
				  host: account.smtp.host,
				  port: account.smtp.port,
				  secure: account.smtp.secure,
				  auth: {
					user: account.user,
					pass: account.pass
				  }
				});
				User.findOne({name:result.host}, function(err, users){
					if(users != null){
						const message = {
						from: "Admin <admin@hotmail.com>",
						to: users.email,
						subject: "Visitor Notification",
						text: "Visitor has checked in"
						};
						transporter.sendMail(message, (err, info) => {
							if (err) console.log("Error occurred. " + err.message);
							console.log("Message sent: %s", info.response);
							console.log("Message sent: %s", message);
						});
					}
					else{
						console.log("Host isn't registered");
					}
				});
			});
			res.redirect(str);
		}
	})
});
//Logout request
app.get('/logout', function(req, res){
	for(var i = 0; i < verified.length; i++){
		if(verified[i].cookies == req.sessionID){
			var index = verified.indexOf(verified[i]);
			if(index > -1)
				verified.splice(index, 1);
		}
	};
	res.redirect('/');
});
//Check if user logged in
function checkVerify(session_id){
	for(var i = 0; i < verified.length; i++){
		if(verified[i].cookies == session_id){
			return true;
		}
	};
	return false;
}
//Check role of the logged in user
function getRole(session_id){
	for(var i = 0; i < verified.length; i++){
		if(verified[i].cookies == session_id){
			return verified[i].role;
		}
	};
	return null;
}
//Get User Name
function getUser(session_id){
	for(var i = 0; i < verified.length; i++){
		if(verified[i].cookies == session_id){
			return verified[i].username;
		}
	};
	return null;
}

