const express = require('express')
var app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const nodemailer = require('nodemailer')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('./model/user')
const DATABASE_URL = 'mongodb://localhost:27017/visitsDB'
mongoose.connect(DATABASE_URL)
var visitsSchema = new mongoose.Schema({id:String,host_email:String,host:String,name:String,date:String,time:String,destination:String,
	car_make:String,car_model:String,plate_number:String,checked_out:String,checked_in:String,reservation:Number,sequence_value:Number
})
var Visit = mongoose.model("visits", visitsSchema)
var transporter = nodemailer.createTransport({service:'gmail',auth:{user:'vmsOthman@gmail.com',pass:'Vms1Vms2Vms3'}})

app.set('view engine', 'ejs')
 .use(express.static('public'))
 .use(bodyParser.urlencoded({extended:true}))
 .use(methodOverride('_method'))
 .use(express.json())
 .use(passport.initialize())
 .use(passport.session())
 .use(require('express-session')({secret:"Use any message here",resave :false,saveUninitialized:false}))
 .use((req, res, next) => {
	res.locals.currentUser = req.user
	next()
})

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
var userName, authenticated
// check authorization
const checkAuthenticated = (_req, res, next) => {
    if (authenticated) { return next() }
    res.redirect('/login')
}
// for visit deletion
const deleteVisit = (req) => {
	Visit.deleteOne({id:req.params.id}, (err, _n) => {
		if(err) console.log(err)
		else Visit.findOne({id: "visitID"}, (err, seq) => {
			if (err) console.log(err)
			else Visit.updateOne({id:"visitID"},{$set:{sequence_value:seq.sequence_value-1}}, (err, _n) => {if (err) console.log(err)})
		})
	})
}
// for editing visits
const editVisit = (req) => {
	Visit.updateOne({id:req.params.id}, {$set: {date:req.body.date,time:req.body.time,destination:req.body.destination, 
		car_make:req.body.car_make,car_model:req.body.car_model,plate_number:req.body.plate_number
	}}, (err, _n) => {if (err) console.log(err)})
}
// for getting edit/show page
const renderPage = async (page, id, res, type, url, home, accept) => {
	visits = await Visit.findOne({id:id})
	res.render(`${page}.ejs`,{type:type,url:url,home:home,accept:accept,visits:visits})
}
// for info pages
const renderInfoPage = async (res, type, url, img, home, accept) => {
	user = await User.findOne({username:userName})
	res.render("info.ejs", {type:type,url:url,img:img,home:home,accept:accept,user:user})
}
// for new visit request
const createNewVisit = (req, res, url, type) => {
	const reservation = Math.ceil(Math.random()*1000000000)
	Visit.findOne({id: "visitID"}, async (err, seq) => {
		if (err) console.log(err) 
		else {
			var host_email = "" 
			var visitor_email = ""
			var host = (type == "Visitor")? req.body.name: userName
			var visitor = (type == "Visitor")? userName: req.body.name
			var sequence_value = seq.sequence_value + 1
			var id = String(sequence_value)
			Visit.updateOne({id: "visitID"}, {$set: {sequence_value: sequence_value}}, (err, _n) => { if (err) console.log(err)})
			const user = await User.findOne({username:host})
			host_email = await user.email
			console.log(host_email)
			var newVisit = new Visit ({id:id,host_email:host_email,host:host,name:visitor,date:req.body.date,
				time:req.body.time,destination:req.body.destination,car_make:req.body.car_make,car_model:req.body.car_model, 
				plate_number:req.body.plate_number,checked_out:"NO",checked_in:"NO",reservation:reservation
			})
			const saved = await newVisit.save()
			console.log("saved")
			if (type == "Visitor") {
				user = await User.findOne({username:userName})
				visitor_email = await user.email 
				transporter.sendMail({from:'vmsOthman@gmail.com',to:`${host_email}, ${visitor_email}`,subject:`New Visit notification`,
				text:`A new visit for ${userName} hosted by ${req.body.host} has been created\nReservation No.: ${reservation}`}, 
				(err, _info) => {if (err) console.log(err)})
				console.log("render")
				renderPage("show", saved.id, res, "Visitors", "visits", "visitorInfo", "Visits")
			}
			else {
				transporter.sendMail({from:'vmsOthman@gmail.com',to:`${host_email}`,subject:`New Visit notification`,
				text:`A new visit for ${req.body.name} hosted by you has been created\nReservation No.: ${reservation}`}, 
				(err, _info) => {if (err) console.log(err)})
				console.log("render")
				renderPage("show", saved.id, res, "Residents", "visitors", "residentInfo", "Guests")
			}
		}
	})
}
// -----------------------------------------------------------------------------------------------------------------------
// RESTful routes 
// Basic request
app.get('/', (_req, res) => {
    res.render('/index.html')
})
// GET registeration
app.get('/register', (_req, res) => {
	res.render('register.ejs')
})
// POST registration
app.post('/register', (req, res) => {
	User.register(new User({username:req.body.username,type:req.body.type,email: req.body.email}), req.body.password, 
		(err,_user) => {
			if(err) {
				console.log(err)
				return res.render('register.ejs')
			}
			passport.authenticate("lcoal")(req, res, () => {
				userName = req.body.username
				authenticated = true				// this is to log the new user in directly
				res.redirect(`/${req.body.type}`)
			})
	})
})
// GET login
app.get('/login', (_req, res) => {
	res.render('login.ejs')
})
// POST login
app.post('/login', passport.authenticate('local', {failureRedirect:'/login'}), (req, res) => { 
	userName = req.user.username
	authenticated = req.isAuthenticated()
	res.redirect('/'+ req.user.type)
})
// GET logout
app.get('/logout', (req, res) => {
	req.logout()
	authenticated = req.isAuthenticated()
    res.redirect('/')
})
// for security Previous Visits
app.get("/visitsPrev", checkAuthenticated, (_req, res) => {
	Visit.find({checked_out:"YES"}, (err, visits) => {
		if (err) console.log(err)
		else res.render("security.ejs",{name:userName,visits:visits,reservation:null,sec:"Previous"}) 
	})
})
// for security Current Visits
app.get("/visitsCurr", checkAuthenticated, (_req, res) => {
	Visit.find({checked_out:"NO"}, (err, visit) => {
		if (err) console.log(err)
		else {
			const visits = []
			visit.forEach((vis) => {if (vis.checked_in == "YES") visits.push(vis) }) 
			res.render("security.ejs",{name:userName,visits:visits,reservation:null,sec:"Current"}) 
		}
	})
})
// Assignment 5
// Check in or Check out from the security account
app.post("/visitsCurr/check", checkAuthenticated, (req, res) => {
	Visit.findOne({reservation: req.body.reservation}, (err, visit) => {
		if (err) console.log(err) 
		else {
			if (visit.checked_in == "YES") {
				Visit.updateOne({reservation: req.body.reservation}, {$set: {checked_in:"NO",checked_out:"YES",reservation:null}}, 
					(err, _vis) => {if (err) console.log(err)})
				transporter.sendMail({from:'vmsOthman@gmail.com',to:visit.host_email,subject:`Check out notification`,
				text:`Dear Mr.${visit.host}\nYour visitor Mr.${visit.name} has been checked out from KFUPM at ${new Date()}\n\nKFUPM Security`}, 
				(err, _info) => {if (err) console.log(err)})
			}
			else if (visit.checked_out == "NO") {
				Visit.updateOne({reservation: req.body.reservation}, {$set: {checked_in: "YES"}}, 
					(err, _vis) => {if (err) console.log(err)})
				transporter.sendMail({from:'vmsOthman@gmail.com',to:visit.host_email,subject:`Check in notification`,
				text:`Dear Mr.${visit.host}\nYour visitor Mr.${visit.name} has been checked in to KFUPM at ${new Date()}\n\nKFUPM Security`}, 
				(err, _info) => {if (err) console.log(err)})
			}
			res.redirect('/visitsCurr')
		}
	})
})
// GET Fast check page
app.get("/fast_check", (_req, res) => {
	res.render("fast.ejs", {reservation: "", status: ""})
})
// Do a fast check, the system will check the reservation number to know if it is check in or out
app.post("/fast_check", (req, res) => {
	const reservation = req.body.reservation
	Visit.findOne({reservation: reservation}, (err, visit) => {
		if (err) console.log(err)
		else {
			if (visit.checked_in == "NO") {
				Visit.updateOne({reservation: reservation}, {$set: {checked_in: "YES"}}, 
					(err, _vis) => {if (err) console.log(err)})
				transporter.sendMail({from:'vmsOthman@gmail.com', to:visit.host_email, subject:`Check in notification`,
				text:`Dear Mr.${visit.host}\nYour visitor Mr.${visit.name} has been checked in to KFUPM at ${new Date()}\n\nKFUPM VMS`}, 
				(err, _info) => {if (err) console.log(err)})
				var msg = "Congrats, you have been successfully checked in.\nWelcome to KFUPM"
			}
			else {
				Visit.updateOne({reservation: reservation}, {$set: {checked_out:"YES",checked_in:"NO",reservation:null}}, 
					(err, _vis) => {if (err) console.log(err)})
				transporter.sendMail({from:'vmsOthman@gmail.com', to:visit.host_email, subject:`Check out notification`,
				text:`Dear Mr.${visit.host}\nYour visitor Mr.${visit.name} has been checked out from KFUPM at ${new Date()}\n\nKFUPM VMS`}, 
				(err, _info) => {if (err) console.log(err)})
				var msg = "Congrats, you have been successfully checked out.\nGood Bye"
			}
			res.render('fast.ejs', {reservation: reservation, status: msg})
		}
	})
})
// route /visitorInfo  ------- GET
app.get("/visitorInfo", checkAuthenticated, (_req, res) => {
	renderInfoPage(res, "Visitors", "visits", "visitor.png", "visitorInfo", "Visits")
})
// route /residentInfo  ------- GET
app.get("/residentInfo", checkAuthenticated, (_req, res) => {
	renderInfoPage(res, "Residents", "visitors", "resident.png", "residentInfo", "Guests")
})
// route /visits/  ------- GET
app.get("/visits", checkAuthenticated, (_req,res) => {
	Visit.find({name:userName}, (err, visits) => {
		if (err) console.log(err)
		else res.render("visits.ejs",{type:"Visitors",url:"visits",home:"visitorInfo",accept:"Visits",visits:visits}) 
	})
})
// route /visitors/  ------- GET
app.get("/visitors", checkAuthenticated, (_req,res) => {
	Visit.find({host:userName}, (err, visits) => {
		if (err) console.log(err)
		else res.render("visits.ejs",{type:"Residents",url:"visitors",home:"residentInfo",accept:"Guests",visits:visits}) 	
	})
})	
// route /visits/new  ------- GET
app.get("/visits/new", checkAuthenticated, (_req,res) => {
	res.render("new.ejs", {type:"Visitors",url:"visits",home:"visitorInfo",accept:"Visits",
		name:"",date:"",time:"",destination:"",car_make:"",car_model:"",plate_number:""
	})
})
// route /visitors/new  ------- GET
app.get("/visitors/new", checkAuthenticated, (_req,res) => {
	res.render("new.ejs", {type:"Residents",url:"visitors",home:"residentInfo",accept:"Guests",
		name:"",date:"",time:"",destination:"",car_make:"",car_model:"",plate_number:""
	})
})
// route /visits  ------- POST
app.post("/visits", checkAuthenticated, (req, res) => {
	createNewVisit(req, res, "visits", "Visitor")
})
// route /visitors  ------- POST
app.post("/visitors", checkAuthenticated, (req, res) => {
	createNewVisit(req, res, "visitors", "Resident")
})
// route /visits/:id  ------- GET
app.get("/visits/:id", checkAuthenticated, (req,res) => {
	renderPage("show", req.params.id, res, "Visitors", "visits", "visitorInfo", "Visits")
})
// route /visitors/:id  ------- GET
app.get("/visitors/:id", checkAuthenticated, (req,res) => {
	renderPage("show", req.params.id, res, "Residents", "visitors", "residentInfo", "Guests")
})
// route /visits/:id/edit  ------- GET
app.get("/visits/:id/edit", checkAuthenticated, (req,res) => {
	renderPage("edit", req.params.id, res, "Visitors", "visits", "visitorInfo", "Visits")
})
// route /visitors/:id/edit  ------- GET
app.get("/visitors/:id/edit", checkAuthenticated, (req,res) => {
	renderPage("edit", req.params.id, res, "Residents", "visitors", "residentInfo", "Guests")
})
// route /visits/:id  ------- PUT
app.put("/visits/:id", checkAuthenticated, (req,res) => {
	editVisit(req)
	res.redirect("/visits")
}) 
// route /visitors/:id  ------- PUT
app.put("/visitors/:id", checkAuthenticated, (req,res) => {
	editVisit(req)
	res.redirect("/visitors")
})
// route /visits/:host  ------- DELETE
app.delete("/visits/:id", checkAuthenticated, (req,res) => {
	deleteVisit(req)
	res.redirect("/visits")
})
// route /visitors/:name  ------- DELETE
app.delete("/visitors/:id", checkAuthenticated, (req,res) => {
	deleteVisit(req)
	res.redirect("/visitors")
})
// -----------------------------------------------------------------------------------------------------------------------
app.listen(3000,() => {console.log("Server is running")})
