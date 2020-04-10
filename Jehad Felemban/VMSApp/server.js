var express = require("express");
var app = express();

var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');

app.use(cookieParser('secret'));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());

var bodyParser = require("body-parser");
var fs = require('fs');
const path = require('path');
var fileName = "./visits.json";
var file = require(fileName);
var methodOverride = require('method-override')

const DATABASE_NAME = 'visits';
const DATABASE_URL = 'mongodb://localhost:27017/visits'

var mongoose = require('mongoose')
mongoose.connect(DATABASE_URL);
var ObjectId = require('mongodb').ObjectId;

var VisitsSchema = new mongoose.Schema({
	id: String,
	host: String,
	name: String,
	date: String,
	destination: String,
	car_make: String,
	car_model: String,
	checked_out: String,
	checkStatus: String,
	checknmp: String
})

var IndexSchema = new mongoose.Schema({
	name: String,
	li: Number
})

var Visits = mongoose.model("visits", VisitsSchema);

var Index = mongoose.model("Index", IndexSchema, "Index");

app.use(express.static("./public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.listen(3000, function () {
	console.log("Server is running");
});

//RESTful routes


//all entries page
app.get("/visits", function (req, res) {
	Visits.find({}, function (err, visitsList) {
		if (err) console.log(err);
		else {
			
			res.render("visits.ejs", { visits: visitsList, message: req.flash('success_msg'), message2: req.flash('unsuccess_msg') });
		}
	})

});

//new entry page
app.get("/visits/new", function (req, res) {
	res.render("newVisit.ejs");
});

//new entry request
app.post("/visits", async function (req, res) {
	// create stdudents 
	// redirect 
	var host = req.body.host;
	var dest = req.body.dest;
	var date = req.body.date;
	var maker = req.body.maker;
	var model = req.body.model;
	var time = req.body.time;
	var id;
	await Index.findOne({ name: "VisitsReq" }, function (err, res) {
		res.li = res.li + 1
		id = res.li
		id = id.toString()
		console.log(id)
		console.log("updated");
		res.save();

	});

	console.log("id after: " + id)




	var newVisit = new Visits({
		id: id,
		host: host,
		name: "ahmed",
		date: date,
		destination: dest,
		car_make: maker,
		car_model: model,
		checked_out: "Yes",
		checkStatus: "inactive",
		checknmp: getRndInteger(0, 99999)
	})
	console.log("check number = " + newVisit.checknmp)
	newVisit.save(function (err, Visits) {
		if (err) return console.error(err);
		console.log(" Added");
	});


	// // check if there is a Visits with the same ID 
	// Visits.find({ id: "7" }, function (err, result) {
	// 	if (err) console.log(err);
	// 	else {
	// 		console.log("First result:" + result)
	// 		if (result == null) {
	// 			console.log(result)
	// 			newVisit.save(function (err, result) {
	// 				console.log("Added!")
	// 				if (err) console.log('Something went wrong')
	// 			});
	// 		}
	// 		else {

	// 		}
	// 	}
	// });
	req.flash('success_msg', "Request Has been added with Check Number: " + newVisit.checknmp);
	res.redirect("/visits");
});


//entry information page
app.get("/visits/:id", function (req, res) {
	var id = req.params.id;

	Visits.findOne({ id: id }, function (err, result) {
		if (err) console.log(err)
		else {
			res.render("showVisit.ejs", { id: id, visits: result });
		}
	})
});

//update entry page
app.get("/visits/:id/edit", function (req, res) {
	var id = req.params.id;
	Visits.findOne({ id: id }, function (err, result) {
		if (err) console.log(err);
		else {
			res.render("editVisit.ejs", { id: id, visit: result });
		}
	})
});


//update entry request
app.put("/visits/:id", function (req, res) {
	//Visits.update({id:"7"},{$set : {host:"AhmedUpdated2"}})
	var id = req.params.id;
	Visits.findOne({ id: id }, function (err, result) {
		if (err) console.log("Problem with Update")
		result.host = req.body.host;
		result.destination = req.body.dest;
		//var time = req.body.time;
		result.car_make = req.body.maker;
		result.car_model = req.body.model;
		result.date = req.body.date;
		console.log("updated");
		result.save();
	})

	res.redirect("/visits");
});

//delete an entry request
app.delete("/visits/:id", function (req, res) {
	var id = Number(req.params.id);

	Visits.deleteOne({ id: id }, function (err, result) {
		if (err) console.log(err)
	});
	res.redirect("/visits");
});

app.get("/security.html", function (req, res) {
	res.sendfile("security.html");
});

//#####################################################
//all entries page
app.get("/residents", function (req, res) {
	var VisJSON = fs.readFileSync('./visits.json');
	var visits = JSON.parse(VisJSON);
	res.render("residents.ejs", { visits: visits });
});

//new entry page
app.get("/residents/new", function (req, res) {
	res.render("newResidents.ejs");
});

//new entry request
app.post("/residents", function (req, res) {
	// create stdudents 
	// redirect 
	var host = req.body.host;
	var dest = req.body.dest;
	var date = req.body.date;
	var maker = req.body.maker;
	var model = req.body.model;
	var time = req.body.time;
	var lastID;
	if (host != undefined && dest != undefined && date != undefined) {
		var visJSON = fs.readFileSync('./visits.json');
		var visits = JSON.parse(visJSON);
		lastID = parseInt(visits[visits.length - 1].id) + 1;

		console.log(lastID);
		visits.push({ id: lastID, host: "test", name: host, date: date, time: time, destination: dest, "car make": maker, "car model": model, "plate number": "00", "checked out": "YES" });
		fs.writeFile(fileName, JSON.stringify(visits), function (err) {
			if (err) return console.log(err);
		});
	}

	res.redirect("/residents");
});

//entry information page
app.get("/residents/:id", function (req, res) {
	var id = req.params.id;
	var visits = JSON.parse(fs.readFileSync('./visits.json'));
	var visitList = {};

	visits.forEach(function (visits) {
		if (visits.id == id) {
			visitList.host = visits.name;
			visitList.destination = visits.destination;
			visitList.time = visits.time;
			visitList["car make"] = visits["car make"];
			visitList["car model"] = visits["car model"];
			visitList.date = visits.date;

		}
	});
	res.render("showResidents.ejs", { id: id, visit: visitList });
});

//update entry page
app.get("/residents/:id/edit", function (req, res) {
	var id = req.params.id;
	var visits = JSON.parse(fs.readFileSync('./visits.json'));
	var visitList = {};

	visits.forEach(function (visits) {
		if (visits.id == id) {
			visitList.id = visits.id
			visitList.host = visits.name;
			visitList.destination = visits.destination;
			visitList.time = visits.time;
			visitList["car make"] = visits["car make"];
			visitList["car model"] = visits["car model"];
			visitList.date = visits.date;

		}
	});
	res.render("editResidents.ejs", { id: visits.id, visit: visitList });
});


//update entry request
app.put("/residents/:id", function (req, res) {
	var id = req.params.id;
	var visits = JSON.parse(fs.readFileSync('./visits.json'));
	visits.forEach(function (visit) {
		if (visit.id == id) {
			visit.name = req.body.host;
			visit.destination = req.body.dest;
			visit.time = req.body.time;
			visit["car make"] = req.body.maker;
			visit["car model"] = req.body.model;
			visit.date = req.body.date;
			console.log("updated");
		}
	});
	fs.writeFile(fileName, JSON.stringify(visits), function (err) {
		if (err) return console.log(err);
	});
	res.redirect("/residents");
});

//delete an entry request
app.delete("/residents/:id", function (req, res) {
	var id = Number(req.params.id);
	var visits = JSON.parse(fs.readFileSync('./visits.json'));
	for (var i = 0; i < visits.length; i++) {
		var obj = visits[i];

		if (obj.id == id) {
			visits.splice(i, 1);
		}
	}
	fs.writeFile(fileName, JSON.stringify(visits), function (err) {
		if (err) return console.log(err);
	});
	res.redirect("/residents");
});


app.get("/check", function (req, res) {
	// Visits.find({}, function (err, visitsList) {
	// 	if (err) console.log(err);
	// 	else {
	// 		res.render("visits.ejs", { visits: visitsList });
	// 	}
	// })

	res.render("check.ejs");


});

//update check status
app.put("/check", async function (req, res) {
	var checknmp = req.body.checkNmp;

	var msg = false
	var msg2;
	console.log("check number : " + checknmp)
	await Visits.findOne({ checknmp: checknmp },  function (err, result) {
		if (err) console.log("Problem with Update")
		else if(result !=null){
			result.host = result.host;
			result.destination = result.destination;
			//var time = req.body.time;
			result.car_make = result.car_make;
			result.car_model = result.car_model;
			result.date = result.date;
			checkStatus = result.checkStatus;
			if (checkStatus == "inactive") {
				result.checkStatus = "active"
				result.checked_out = "NO"
				console.log("request with nmp: " + checknmp + " has been activated")
				msg = 'Visit Request Has Been Activated & Visitor Has been checked-In!!';
			} else if (checkStatus == "active") {
				result.checked_out = "YES"
				console.log("request with nmp: " + checknmp + " has been Checked OUT")
				msg = 'Visitor Has Been Checked-Out!!';
			} else {
				console.log("Error in check page request")
				msg2 = 'Check status has not been Updated';
			}
			console.log("updated");
			result.save();
		}else{
			msg2 = 'Invalid check Code, Please try again!!';
		}

	})

	req.flash('success_msg', msg);
	req.flash('unsuccess_msg', msg2);
	console.log(checknmp);
	res.redirect("/visits");
});


function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = app;