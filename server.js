if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
var nodemailer = require('nodemailer');
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var fs = require('fs');
const path = require('path');
var fileName = "./visits.json";
//var file = require(fileName);
var methodOverride = require('method-override')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')


const initializePassport = require('./passport-config')
initializePassport(
    passport,
    Username => users.findOne(user => user.Username === Username),
    Email => users.find(user => user.Email === Email)
)



app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: "potato",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

const DATABASE_NAME = 'COE445';
const DATABASE_URL = 'mongodb://localhost:27017/COE445'

var mongoose = require('mongoose')
mongoose.connect(DATABASE_URL);


var userSchema = new mongoose.Schema({
    Username: String,
    Password: String,
    Email: String,
    Role: String

})


var visitSchema = new mongoose.Schema({
    id: Number,
    host: String,
    name: String,
    date: String,
    time: String,
    destination: String,
    car_make: String,
    car_model: String,
    plate_number: String,
    checked_out: String,
    pin: String,
    hostEmail: String
})

var userCollection = mongoose.model("users", userSchema, "users")
var Collection = mongoose.model("visits", visitSchema, "visits");



app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.json());

app.listen(3000, function() {
    console.log("Server is running");
});

//RESTful routes
app.get("/", function(request, response) {
    res.redirect("/visits");
});

app.get("/visits/new", function(req, res) {
    res.render("new.ejs");
});

app.post("/visits", function(req, res) {

    var id = req.body.id;
    var name = req.body.name;
    var brand = req.body.brand;
    var model = req.body.model;
    var LI = req.body.LI;
    var destination = req.body.destination;
    var date = req.body.date;
    var time = req.body.time;
    var host = req.body.host;
    var no = "no";
    var email = req.body.hostEmail;
    var pinGenerator = (Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000).toString();

    var newVisit1 = new Collection({

        id: id,
        host: host,
        name: name,
        date: date,
        time: time,
        destination: destination,
        car_make: brand,
        car_model: model,
        plate_number: LI,
        checked_out: no,
        pin: pinGenerator,
        hostEmail: email

    })

    Collection.findOne({
        id: id,
        host: host,
        name: name,
        date: date,
        time: time,
        destination: destination,
        car_make: brand,
        car_model: model,
        plate_number: LI,
        hEmail: email
    }, function(err, testVisit) {
        if (err) console.log(err);
        else {
            if (testVisit == null) {
                console.log(testVisit)
                newVisit1.save(function(err, newVisit12) {
                    if (err) console.log('Something went wrong')
                });
            } else {

            }
        }
    });

    // if (brand != undefined && model != undefined && LI != undefined && destination != undefined && date != undefined && time != undefined && host != undefined) {
    //     var visitJSON = fs.readFileSync('./visits.json');
    //     var newVisits = JSON.parse(visitJSON);
    //     newVisits.push({ id: id, host: host, name: name, date: date, time: time, destination: destination, "car make": brand, "car model": model, "plate number": LI, "checked out": no });
    //     fs.writeFile(fileName, JSON.stringify(newVisits), function(err) {
    //         if (err) return console.log(err);
    //     });
    // }

    res.redirect("/visits");
});

app.delete("/visits/:id", function(req, res) {
    var id = req.params.id;
    //var id = Number(req.params.id);
    // var visits = JSON.parse(fs.readFileSync('./visits.json'));
    // for (var i = 0; i < visits.length; i++) {
    //     var obj = visits[i];

    //     if (obj.id == id) {
    //         visits.splice(i, 1);
    //     }
    // }
    // fs.writeFile(fileName, JSON.stringify(visits), function(err) {
    //     if (err) return console.log(err);
    // });

    Collection.deleteOne({ id: id }, function(err, result) {
        if (err) console.log(err)
        res.redirect("/visits");
    });
});

app.get("/visits", function(req, res) {
    // var visitJSON = fs.readFileSync('./visits.json');
    // var visits = JSON.parse(visitJSON);
    // console.log(students);
    Collection.find({}, function(err, visits) {
        if (err) console.log(err);
        else {
            res.render("visits.ejs", { visits: visits });
        }
    })
});

app.put("/visits/:id", function(req, res) {
    var id = req.params.id;
    var brand = req.body.brand;
    var model = req.body.model;
    var LI = req.body.LI;
    var destination = req.body.destination;
    var date = req.body.date;
    var time = req.body.time;
    var host = req.body.host;
    var email = req.body.hostEmail;
    var name = req.body.name;

    Collection.updateOne({ id: id }, {



        destination: destination,
        car_make: brand,
        car_model: model,
        plat_number: LI,
        date: date,
        time: time,
        host: host,
        name: name,
        hostEmail: email

    }, function(err) { if (err) return console.error(err) });




    // var visits = JSON.parse(fs.readFileSync('./visits.json'));
    //  visits.forEach(function(visit) {
    // if (visit.id == id) {

    // var brand = req.body.brand;
    // var model = req.body.model;
    // var LI = req.body.LI;
    // var destination = req.body.destination;
    // var date = req.body.date;
    // var time = req.body.time;
    // var host = req.body.host;

    // visit.destination = destination;
    // visit['car make'] = brand;
    // visit['car model'] = model;
    // visit['plate number'] = LI;
    // visit.date = date;
    // visit.time = time;
    // visit.host = host;
    //  }
    //  });
    // fs.writeFile(fileName, JSON.stringify(visits), function(err) {
    //     if (err) return console.log(err);
    // });
    res.redirect("/visits");
});

app.get("/visits/:id/edit", function(req, res) {
    var id = req.params.id;
    var cvisit = {};
    cvisit.id = id;
    //var visits = JSON.parse(fs.readFileSync('./visits.json'));
    //visits.forEach(function(visit) {
    // if (visit.id == id) {
    Collection.findOne({ id: id }, function(err, visits) {
        if (err) console.log(err);
        else {

            cvisit.hostEmail = visits.hostEmail;
            cvisit.name = visits.name;
            cvisit.host = visits.host;
            cvisit.date = visits.date;
            cvisit.time = visits.time;
            cvisit.destination = visits.destination;
            cvisit.car_make = visits.car_make;
            cvisit.car_model = visits.car_model;
            cvisit.plate_number = visits.plate_number;

            res.render("edit.ejs", { visits: cvisit });
        }
    })

    //  }
    //});
    //res.render("edit.ejs", { visit: cvisit });
});

app.get("/visits/:id", function(req, res) {
    var id = req.params.id;
    Collection.findOne({ id: id }, function(err, visits) {
        if (err) console.log(err)
        else {
            //console.log(showedvisits.name)
            res.render("show.ejs", {
                id: visits.id,
                name: visits.name,
                host: visits.host,
                date: visits.date,
                time: visits.time,
                destination: visits.destination,
                car_make: visits.car_make,
                car_model: visits.car_model,
                plate_number: visits.plate_number,
                pin: visits.pin,
                hostEmail: visits.hostEmail
            });
        }
    })

});
//var visits = JSON.parse(fs.readFileSync('./visits.json'));
//     var name, host, date, time, destination, carMake, carModel, plateNumber;
//     visits.forEach(function(visit) {
//         if (visit.id == id) {
//             id = visit.id;
//             name = visit.name;
//             host = visit.host;
//             date = visit.date;
//             time = visit.time;
//             destination = visit.destination;
//             carMake = visit["car make"];
//             carModel = visit["car model"];
//             plateNumber = visit["plate number"];
//         }
//     });
//     res.render("show.ejs", { id: id, name: name, host: host, date: date, time: time, destination: destination, carMake: carMake, carModel: carModel, plateNumber: plateNumber });
//});



app.get('/', (req, res) => {
    res.render('index.ejs', { username: req.user.username })
})

app.get('/login', (req, res) => {
    res.render('login.ejs')
})
app.get('/Resident', (req, res) => {
    res.render('Resident.ejs')
})
app.get('/Security', (req, res) => {
    res.render('Security.ejs')
})








app.post("/login", function(req, res) {
    var username = req.body.Username;
    var password = req.body.Password;
    if (username == "" || password == "") {
        res.render("login.ejs");
    } else {
        userCollection.findOne({
            Username: username,
            Password: password
        }, function(err, result) {
            if (err) console.log(err);
            else {
                role = result.Role;
                if (role == "Visitor") {
                    res.redirect("/visits")
                } else if (role == "Resident") {
                    res.redirect("/Resident")
                } else if (role == "Security") {
                    res.redirect("/Security")
                } else {
                    res.redirect("/login")
                }
            }
        });
    }
});



app.get('/register', (req, res) => {
    res.render('register.ejs')
})

app.post('/register', function(req, res) {



    Username = req.body.Username
    Email = req.body.Email


    var newUser = new userCollection({
        Username: req.body.Username,
        Email: req.body.Email,
        Password: req.body.Password,
        Role: req.body.Role




    })

    userCollection.findOne({
        Username: Username,
        Email: Email


    }, function(err, testUser) {
        if (err) console.log(err);
        else {
            if (testUser == null) {
                console.log(testUser)
                newUser.save(function(err, newUser1) {
                    if (err) console.log('Something went wrong')
                });
            } else {

            }
        }
    });

    res.redirect('/login')

});

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}
app.put("/check", function(req, res) {
    var pin = req.body.pin;

    Collection.findOne({ pin: pin }, function(err, visits) {
        if (err) console.log(err);

        else if (visits.checked_out == "no") {
            Collection.updateOne({ pin: pin }, {
                checked_out: "inside"

            }, function(err) {
                if (err) return console.error(err)
            });

        } else if (visits.checked_out == "inside") {
            Collection.updateOne({ pin: pin }, {
                checked_out: "outside"

            }, function(err, result) {


                if (err) return console.error(err)



            });

        }



    })





    var cvisit = {};
    Collection.findOne({ pin: pin }, function(err, visits) {
        if (err) console.log(err);


        else {


            // cvisit.id = visits.id;
            // cvisit.name = visits.name;
            // cvisit.hostEmail = visits.hostEmail;
            // cvisit.host = visits.host;
            // cvisit.date = visits.date;
            // cvisit.time = visits.time;
            // cvisit.destination = visits.destination;
            // cvisit.car_make = visits.car_make;
            // cvisit.car_model = visits.car_model;
            // cvisit.plate_number = visits.plate_number;
            // cvisit.checked_out = visits.checked_out;
            // cvisit.pin = visits.pin;
            // cvisit.checked_out = visits.checked_out;

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'alivms36@gmail.com',
                    pass: '159357147'
                }
            });
            var mailOptions;
            var checked;
            if (visits.checked_out == "no") {
                checked = "inside";

                mailOptions = {
                    from: 'alivms36@gmail.com',
                    to: visits.hostEmail,
                    subject: 'From VMSApp',

                    text: 'The visitor named ' + visits.name + ' has checked inside'
                };

            } else if (visits.checked_out == "inside") {
                checked = "outside"
                mailOptions = {
                    from: 'alivms36@gmail.com',
                    to: visits.hostEmail,
                    subject: 'From VMSApp',

                    text: 'The visitor named ' + visits.name + ' has checked outside '
                };

            }


            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });


            res.render("info.ejs", {
                id: visits.id,
                name: visits.name,
                hostEmail: visits.hostEmail,
                host: visits.host,
                date: visits.date,
                time: visits.time,
                destination: visits.destination,
                car_make: visits.car_make,
                car_model: visits.car_model,
                plate_number: visits.plate_number,
                pin: visits.pin,
                checked_out: checked
            });



        }
    })

});

app.get('/check', (req, res) => {
    res.render('check.ejs')
})