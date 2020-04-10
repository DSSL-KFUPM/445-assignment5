var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const path = require('path');
var fileName = "./students.json";
var file = require(fileName);
var methodOverride = require('method-override')
const Nexmo = require('nexmo');
const socketio = require('socket.io');


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
	destination: String,
	car_make: String,
	car_model: String,
	plate_number: String,
	random_number:String,
	mobile:String,
	checked_out: String
})

var Visit = mongoose.model("Visit", visitSchema);

var residentSchema = new mongoose.Schema({
	host: String,
	name: String,
	date: String,
	destination: String,
	car_make: String,
	car_model: String,
	plate_number: String,
	random_number:String,
	mobile:String,
	checked_out: String
})

var resident = mongoose.model("resident", residentSchema);


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session())
app.use(require('express-session')({
	secret:"Use any message here",
	resave : false,
	saveUninitialized:false
})) 

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Init Nexmo

const nexmo = new Nexmo({
	apiKey: 'a1c46f45',
	apiSecret: 'i7LKMvcxZZxk1uCQ',
  }, { debug: true });
  

var  virtual_number ='YOURVURTUALNUMBER';
app.listen(3000,function(){
	console.log("Server is running on port 3000");
});

//RESTful routes

//auth routes
app.get('/register',function(req,res){
	res.render('register.ejs');
})

app.post('/register',function(req,res){
     role = req.body.role;
	User.register(new User({username:req.body.username,role:role}), req.body.password, function(err,user){
		if(err) {
			console.log(err)
			return res.render('register')
		}
		passport.authenticate("lcoal")(req,res,function(){
			if(role =="visitor"){
			res.redirect('/visits');
		}
		else if (role =="resident")  {
			res.redirect('/residents');
		}else{
			res.redirect('/security');
		}
		})
	})
})

app.get('/login', function(req,res){
	res.render('login.ejs');
}) 


var role;
app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }),
async function(req, res) {	
	
	var name = req.body.username;
	User.findOne({username:name},function(err,user){
		role = 	user.role;	
		if(err) {
			console.log(err)
			return res.render('login')
		}
		if(user.role =="visitor"){

			res.redirect('/visits');
		}
		else if (user.role =="resident")  {
			res.redirect('/residents');
		}
		else{
			res.redirect('/security');
		}})
	
 // res.redirect(role);
});

app.get('/logout', function(req,res){
	req.logout();
	res.redirect('/')
})


function isLoggedIn(req,res,next){
	console.log('Checking begore deciding')
	if (req.isAuthenticated()) {
		console.log('Yes butt')
		return next()
	}
	res.redirect('/login')
}

app.get("/",function(req,res){
	res.sendFile("public/index.html");
	//res.redirect("/students");
});

app.get("/visits/new", function(req,res){
	res.render("new.ejs");
});

app.post("/visits", function(req,res){

	var host = req.body.Host;
	var name = req.body.Name;
	var date = req.body.Date;
	var time = req.body.VisitTime;
	var destination = req.body.DestinationBuilding;
	var CarMake = req.body.CarMake;
	var CarModel = req.body.CarModel;
	var CarPlate = req.body.CarPlate;
	var randomNumber = Math.floor(100000 + Math.random() * 900000);
	var mobile = req.body.Mobile;
	var CheckedOut = req.body.CheckedOut;


	var newvisit = new Visit({
		host: host,
		name: name,
		date: date,
		destination: destination,
		car_make: CarMake,
		car_model: CarModel,
		plate_number: CarPlate,
		random_number :randomNumber,
		mobile : mobile,
		checked_out: CheckedOut
	})

	// check if there is a student with the same ID 
	Visit.findOne({name:name}, function(err,visits){
		if(err) console.log(err);
		else{
		Visit.findOne({narandom_numberme:randomNumber}, function(err,visits){
			if(err) {
				console.log(err);
				randomNumber = Math.floor(100000 + Math.random() * 900000);
				newvisit.save(function(err, visit){
					if(err) console.log('Something went wrong')
				});
			}
					else{
						if(visits == null ){
							console.log(visits)
							newvisit.save(function(err, visit){
								if(err) console.log('Something went wrong')
							});
						}
	
					}
				});
			}
		
		});	
		
		if(role =="visitor"){	
			res.redirect('/visits/');
	}
	else{
		res.redirect('/security');
	}
	});


app.delete("/visits/:name", function(req,res){
	var name = req.params.name;
	Visit.deleteOne({name:name},function(err,result){
		if(err) console.log(err)
	});
	res.redirect("/security");
});


app.get("/visits", function(req,res){
	Visit.find({},function(err, visits){
		if(err) console.log(err);
		else{
			// res.send(students)
			res.render("visits.ejs",{visits:visits});
		}
	})

});	



app.get("/security", function(req,res){
	Visit.find({},function(err, visits){
		resident.find({},function(err, residents){
		if(err) console.log(err);
		else{
			// res.send(students)
			res.render("security.ejs",{visits:visits,residents:residents});
		}
	})
})

});	


app.put("/visits/:name",function(req,res){
	var name = req.params.name;
	var host = req.body.Host;
	var date = req.body.Date;
	var time = req.body.VisitTime;
	var destination = req.body.DestinationBuilding;
	var CarMake = req.body.CarMake;
	var CarModel = req.body.CarModel;
	var CarPlate = req.body.CarPlate;
	var CheckedOut = req.body.CheckedOut;
	Visit.findOne({name:name}, function (err, doc){
		doc.host = host;
		doc.date = date;
		doc.destination = destination;
		doc.car_make = CarMake;
		doc.car_model = CarModel;
		doc.plate_number = CarPlate;
		doc.checked_out = CheckedOut;
		doc.save();
	res.redirect("/security");
});
});

app.get("/visits/:name/edit", function(req,res){
	var name = req.params.name;
	var cvisit = {};
	cvisit.name = name;

	Visit.findOne({name:name}, function(err,result){
		if(err) console.log(err);
		else{
			cvisit.host = result.host;
			cvisit.date = result.date;
			cvisit.time = result.time;
			cvisit.destination = result.destination;
			cvisit.car_make = result.car_make;
			cvisit.car_model = result.car_model;
			cvisit.plate_number= result.plate_number;
			cvisit.checked_out  = result.checked_out;
			res.render("edit.ejs",{visit:cvisit});
		}
	})
	
});

app.get("/visits/:name", function(req,res){
	var name = req.params.name;
	Visit.find({name:name}, function(err, visits){
		if(err) console.log(err)
		else{
			console.log(visits.name)
			res.render("show.ejs", {m:name,visits:visits});
		}
	})
	
}); 

////////////////////////////////////////////////*  residents   *//////////////////////////////////////////////

app.get("/residents/new", function(req,res){
	res.render("new1.ejs");
});

app.post("/residents", function(req,res){

	var host = req.body.Host;
	var name = req.body.Name;
	var date = req.body.Date;
	var destination = req.body.DestinationBuilding;
	var CarMake = req.body.CarMake;
	var CarModel = req.body.CarModel;
	var CarPlate = req.body.CarPlate;
	var randomNumber = Math.floor(100000 + Math.random() * 900000);
	var mobile = req.body.Mobile;
	var CheckedOut = req.body.CheckedOut;

	var newresident = new resident({
		host: host,
		name: name,
		date: date,
		destination: destination,
		car_make: CarMake,
		car_model: CarModel,
		plate_number: CarPlate,
		random_number :randomNumber,
		mobile : mobile,
		checked_out: CheckedOut
	})

	// check if there is a student with the same ID 
	resident.findOne({name:name}, function(err,residents){
		if(err) console.log(err);
		else{
			resident.findOne({narandom_numberme:randomNumber}, function(err,residents){
				if(err) {
					console.log(err);
					randomNumber = Math.floor(100000 + Math.random() * 900000);
					newresident.save(function(err, resident){
						if(err) console.log('Something went wrong')
					});
				}
						else{
							if(residents == null ){
								console.log(residents)
								newresident.save(function(err, resident){
									if(err) console.log('Something went wrong')
								});
							}
		
						}
					});
				}
	});
	if (role =="resident"){
		res.redirect('/residents');
	}
	else{
		res.redirect('/security');
	}
});

app.delete("/residents/:name", function(req,res){
	var name = req.params.name;
	resident.deleteOne({name:name},function(err,result){
		if(err) console.log(err)
	});
	res.redirect("/security");
});

app.get("/residents", function(req,res){
	resident.find({},function(err, residents){
		if(err) console.log(err);
		else{
			// res.send(students)
			res.render("residents.ejs",{residents:residents});
		}
	})

});	

app.put("/residents/:name",function(req,res){
	var name = req.params.name;
	var host = req.body.Host;
	var date = req.body.Date;
	var destination = req.body.DestinationBuilding;
	var CarMake = req.body.CarMake;
	var CarModel = req.body.CarModel;
	var CarPlate = req.body.CarPlate;
	var CheckedOut = req.body.CheckedOut;
	resident.findOne({name:name}, function (err, doc){
		doc.host = host;
		doc.date = date;
		doc.destination = destination;
		doc.car_make = CarMake;
		doc.car_model = CarModel;
		doc.plate_number = CarPlate;
		doc.checked_out = CheckedOut;
		doc.save();
	res.redirect("/security");
});
});

app.get("/residents/:name/edit", function(req,res){
	var name = req.params.name;
	var cresident = {};
	cresident.name = name;

	resident.findOne({name:name}, function(err,result){
		if(err) console.log(err);
		else{
			cresident.host = result.host;
			cresident.date = result.date;
			cresident.time = result.time;
			cresident.destination = result.destination;
			cresident.car_make = result.car_make;
			cresident.car_model = result.car_model;
			cresident.plate_number= result.plate_number;
			cresident.checked_out  = result.checked_out;
			res.render("edit1.ejs",{resident:cresident});
		}
	})
	
});

app.get("/residents/:name", function(req,res){
	var name = req.params.name;
	resident.find({name:name}, function(err, residents){
		if(err) console.log(err)
		else{
			console.log(residents.name)
			res.render("show1.ejs", {m:name,residents:residents});
		}
	})
	
});
////////////////////////////////////////////////*  security   *//////////////////////////////////////////////

app.get("/check", function(req,res){
	resident.find({},function(err, residents){
		if(err) console.log(err);
		else{
			// res.send(students)
			res.render("check.ejs",{residents:residents});
		}
	})

});	
app.post("/check",function(req,res){
	var randomNumber = req.body.R;
	var CheckedOut = 'NO';
	var CheckedIN = 'YES';
	resident.findOne({random_number:randomNumber}, function (err, doc){
		if(doc.checked_out == 'NO'){
		doc.checked_out = CheckedIN;
		doc.save();
		var number = doc.mobile;
		var text = 'you are checked out';
		nexmo.message.sendSms(
			virtual_number, number, text, { type: 'unicode' },
			(err, responseData) => {
			  if(err) {
				console.log(err);
			  } else {
				const { messages } = responseData;
				const { ['message-id']: id, ['to']: number, ['error-text']: error  } = messages[0];
				console.dir(responseData);
				// Get data from response
				const data = {
				  id,
				  number,
				  error
				};
		
				// Emit to the client
				io.emit('smsStatus', data);
			  }
			}
		  );
		}else{
			doc.checked_out = CheckedOut;
			doc.save();
			var number = doc.mobile;
			var text = 'you are checked IN';
			nexmo.message.sendSms(
				virtual_number, number, text, { type: 'unicode' },
				(err, responseData) => {
				  if(err) {
					console.log(err);
				  } else {
					const { messages } = responseData;
					const { ['message-id']: id, ['to']: number, ['error-text']: error  } = messages[0];
					console.dir(responseData);
					// Get data from response
					const data = {
					  id,
					  number,
					  error
					};
			
					// Emit to the client
					io.emit('smsStatus', data);
				  }
				}
			  );
		}
		res.redirect("/residents");
		
});
});
app.get("/check1", function(req,res){
	Visit.find({},function(err, visits){
		if(err) console.log(err);
		else{
			// res.send(students)
			res.render("check1.ejs",{visits:visits});
		}
	})

});	
app.post("/check1",function(req,res){
	var randomNumber = req.body.R;
	var CheckedOut = 'NO';
	var CheckedIN = 'YES';
	Visit.findOne({random_number:randomNumber}, function (err, doc){
		if(doc.checked_out == 'NO'){
		doc.checked_out = CheckedIN;
		doc.save();
		var number = doc.mobile;
		var text = 'you are checked out';
		nexmo.message.sendSms(
			virtual_number, number, text, { type: 'unicode' },
			(err, responseData) => {
			  if(err) {
				console.log(err);
			  } else {
				const { messages } = responseData;
				const { ['message-id']: id, ['to']: number, ['error-text']: error  } = messages[0];
				console.dir(responseData);
				// Get data from response
				const data = {
				  id,
				  number,
				  error
				};
		
				// Emit to the client
				io.emit('smsStatus', data);
			  }
			}
		  );
		}else{
			doc.checked_out = CheckedOut;
			doc.save();
			var number = doc.mobile;
			var text = 'you are checked IN';
			nexmo.message.sendSms(
				virtual_number, number, text, { type: 'unicode' },
				(err, responseData) => {
				  if(err) {
					console.log(err);
				  } else {
					const { messages } = responseData;
					const { ['message-id']: id, ['to']: number, ['error-text']: error  } = messages[0];
					console.dir(responseData);
					// Get data from response
					const data = {
					  id,
					  number,
					  error
					};
			
					// Emit to the client
					io.emit('smsStatus', data);
				  }
				}
			  );
		}
		res.redirect("/visits");
		
});
});

app.get("/checks", function(req,res){
			res.render("checks.ejs");
});	

app.post("/checks1",function(req,res){
	var randomNumber = req.body.R;
	var CheckedOut = 'NO';
	var CheckedIN = 'YES';
	Visit.findOne({random_number:randomNumber}, function (err, doc){
		if(doc.checked_out == 'NO'){
		doc.checked_out = CheckedIN;
		doc.save();
		var number = doc.mobile;
		var text = 'you are checked out';
		nexmo.message.sendSms(
			virtual_number, number, text, { type: 'unicode' },
			(err, responseData) => {
			  if(err) {
				console.log(err);
			  } else {
				const { messages } = responseData;
				const { ['message-id']: id, ['to']: number, ['error-text']: error  } = messages[0];
				console.dir(responseData);
				// Get data from response
				const data = {
				  id,
				  number,
				  error
				};
		
				// Emit to the client
				io.emit('smsStatus', data);
			  }
			}
		  );
		}else{
			doc.checked_out = CheckedOut;
			doc.save();
			var number = doc.mobile;
			var text = 'you are checked IN';
			nexmo.message.sendSms(
				virtual_number, number, text, { type: 'unicode' },
				(err, responseData) => {
				  if(err) {
					console.log(err);
				  } else {
					const { messages } = responseData;
					const { ['message-id']: id, ['to']: number, ['error-text']: error  } = messages[0];
					console.dir(responseData);
					// Get data from response
					const data = {
					  id,
					  number,
					  error
					};
			
					// Emit to the client
					io.emit('smsStatus', data);
				  }
				}
			  );
		}
		res.redirect("/security");
		
});
});
app.post("/checks",function(req,res){
	var randomNumber = req.body.R1;
	var CheckedOut = 'NO';
	var CheckedIN = 'YES';
	resident.findOne({random_number:randomNumber}, function (err, doc){
		if(doc.checked_out == 'NO'){
		doc.checked_out = CheckedIN;
		doc.save();
		var number = doc.mobile;
		var text = 'you are checked out';
		nexmo.message.sendSms(
			virtual_number, number, text, { type: 'unicode' },
			(err, responseData) => {
			  if(err) {
				console.log(err);
			  } else {
				const { messages } = responseData;
				const { ['message-id']: id, ['to']: number, ['error-text']: error  } = messages[0];
				console.dir(responseData);
				// Get data from response
				const data = {
				  id,
				  number,
				  error
				};
		
				// Emit to the client
				io.emit('smsStatus', data);
			  }
			}
		  );
		}else{
			doc.checked_out = CheckedOut;
			doc.save();
			var number = doc.mobile;
			var text = 'you are checked IN';
			nexmo.message.sendSms(
				virtual_number, number, text, { type: 'unicode' },
				(err, responseData) => {
				  if(err) {
					console.log(err);
				  } else {
					const { messages } = responseData;
					const { ['message-id']: id, ['to']: number, ['error-text']: error  } = messages[0];
					console.dir(responseData);
					// Get data from response
					const data = {
					  id,
					  number,
					  error
					};
			
					// Emit to the client
					io.emit('smsStatus', data);
				  }
				}
			  );
		}
		res.redirect("/security");
		
});
});
// Define port
const port = 3001;

// Start server
const server = app.listen(port, () => console.log(`Server started`));

// Connect to socket.io
const io = socketio(server);
io.on('connection', (socket) => {
  console.log('Connected');
  io.on('disconnect', () => {
    console.log('Disconnected');
  })
});
