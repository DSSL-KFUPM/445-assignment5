var express = require("express");
var app = express();
var nodemailer = require('nodemailer');
var bodyParser = require("body-parser");
// var cookieParser = require("cookie-parser");
var fs = require('fs');
const path = require('path');
// var expresshbs = require("express-handlebars");
// var expressValidator = require("express-validator");
// var flash=require('connect-flash')
var fileName = "./visits.json";
var file = require(fileName);
var methodOverride = require('method-override')

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'no.reply.vms.kfupm@gmail.com',
        pass: 'vmskfupm'
    }
});
const DATABASE_NAME = 'COE445';
const DATABASE_URL = 'mongodb://127.0.0.1:27017/COE445';

var mongoose = require('mongoose');
mongoose.connect(DATABASE_URL);
// mongoose.connect(DATABASE_URL, {
//         useUnifiedTopology: true,
//         useNewUrlParser: true,
//     })
//     .then(() => console.log('DB Connected!'))
//     .catch(err => {
//         console.log(err);
//     });
var VisitSchema = new mongoose.Schema({
    host: String,
    hostid: String,
    name: String,
    name_nat_id: String,
    date: String,
    time: String,
    dtime: String,
    destination: String,
    car_make: String,
    car_model: String,
    car_year: String,
    car_color: String,
    plate_number: String,
    checked_out: String,
    pin: String
})


var UserSchema = new mongoose.Schema({
    fullname: String,
    userid: String,
    email: String,
    mobile_number: String,
    password: String,
    role: String,
})


var visit_collection = mongoose.model("visits", VisitSchema, "visits");
var user_collection = mongoose.model("Users", UserSchema, "Users");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.json());

app.listen(3000, function() {
    console.log("Server is running");
});

app.use('/imgs', express.static(__dirname + "/imgs"));
app.use('/css', express.static(__dirname + "/css"));
app.use('/index', express.static(__dirname + "/views"));

// app.get("/", function(req, res) {
//     res.redirect("/Visitors");
// });

app.get("/Security", function(req, res) {
    res.render("Security.ejs");
});

app.get("/Residents", function(req, res) {
    res.render("Residents.ejs");
});

app.get("/Visitors/new", function(req, res) {
    res.render("new_visit_request.ejs");
});
app.get("/register", function(req, res) {
    res.render("register.ejs");
});
app.get("/login", function(req, res) {
    res.render("login.ejs");
});
app.post("/register", function(req, res) {
    // create stdudents 
    // redirect 
    var fname = req.body.first_name;
    var lname = req.body.last_name;
    var userid = req.body.user_id;
    var mail = req.body.email;
    var mobile = req.body.mobile_no;
    var password = req.body.password;
    var role = req.body.user_role;

    if (fname == "" || lname == "" || userid == "" || mail == "" || mobile == "" || password == "" || role == "") {
        res.render('register.ejs');
    } else {
        var newUser = new user_collection({
            fullname: fname + " " + lname,
            userid: userid,
            email: mail,
            mobile_number: mobile,
            password: password,
            role: role,
        })
        console.log(newUser);

        // check if there is a visit with the same ID 
        user_collection.findOne({
            fullname: fname + " " + lname,
            userid: userid,
            email: mail,
            mobile_number: mobile,
            password: password,
            role: role,
        }, function(err, user) {
            if (err) console.log(err);
            else {
                if (user == null) {
                    console.log(user)
                    newUser.save(function(err, user_records) {
                        if (err) console.log('Something went wrong')
                    });
                } else {

                }
            }
        });
        res.redirect("/login");
    }
});
app.post("/login", function(req, res) {
    var mail = req.body.mail;
    var password = req.body.pass;
    if (mail == "" || password == "") {
        res.render('login.ejs');
    } else {
        user_collection.findOne({
            email: mail,
            password: password
        }, function(err, result) {
            if (err) {
                console.log(err);
                res.redirect("/login")
            } else {
                console.log(result.role)
                ROLE = result.role;
                if (ROLE == "Visitor") {
                    res.redirect("/Visitors/" + result.userid)
                        // res.redirect("Security.html")
                } else if (ROLE == "Resident") {
                    res.redirect("/Residents")
                } else if (ROLE == "Security") {
                    res.redirect("/Security")
                } else {
                    res.redirect("/login")
                }
            }
        });
    }
});

// passport.use(new LocalStrategy(
//     function(username, password, done) {
//       User.findOne({ username: username }, function (err, user) {
//         if (err) { return done(err); }
//         if (!user) { return done(null, false); }
//         if (!user.verifyPassword(password)) { return done(null, false); }
//         return done(null, user);
//       });
//     }
//   ));
//   app.post('/login', 
//   passport.authenticate('local', { failureRedirect: '/login' }),
//   function(req, res) {
//     res.redirect('/');
//   });


app.post("/Visitors", function(req, res) {
    // create stdudents 
    // redirect 
    var host = req.body.host;
    var RKID = req.body.hostid;
    var name = req.body.name;
    var name_natid = req.body.name_nat_id;
    var vdate = req.body.date;
    var vtime = req.body.time;
    var vdtime = req.body.dtime;
    var car_make = req.body.car_make;
    var car_model = req.body.car_model;
    var car_year = req.body.car_year;
    var car_color = req.body.car_color;
    var plate_number = req.body.plate_number;
    var destination = req.body.destination;

    var pin_gen = (Math.floor(Math.random() * (1000000 - 100000 + 1)) + 100000).toString();


    var newVisit = new visit_collection({
        host: host,
        hostid: RKID,
        name: name,
        name_nat_id: name_natid,
        date: vdate,
        time: vtime,
        dtime: vdtime,
        destination: destination,
        car_make: car_make,
        car_model: car_model,
        car_year: car_year,
        car_color: car_color,
        plate_number: plate_number,
        pin: pin_gen,
        checked_out: "Reserved"
    })
    console.log(newVisit);

    // check if there is a visit with the same ID 
    visit_collection.findOne({
        host: host,
        hostid: RKID,
        name: name,
        name_nat_id: name_natid,
        date: vdate,
        time: vtime,
        dtime: vdtime,
        destination: destination,
        car_make: car_make,
        car_model: car_model,
        car_year: car_year,
        car_color: car_color,
        plate_number: plate_number,
    }, function(err, visit_test) {
        if (err) console.log(err);
        else {
            if (visit_test == null) {
                console.log(visit_test)
                newVisit.save(function(err, visit_records) {
                    if (err) console.log('Something went wrong')
                });
            } else {

            }
        }
    });

    // if (host != undefined && RKID != undefined && name != undefined && name_natid != undefined && vdate != undefined && vtime != undefined && vdtime != undefined && car_make != "Choose.." && car_model != "Choose.." && car_year != "Choose.." && car_color != "Choose.." && plate_number != undefined && destination != "Choose..") {
    //     var visitJSON = fs.readFileSync('./visits.json');
    //     var visiits = JSON.parse(visitJSON);
    //     visiits.push({ host: host, hostid: RKID, name: name, name_nat_id: name_natid, date: vdate, time: vtime, dtime: vdtime, destination: destination, car_make: car_make, car_model: car_model, car_year: car_year, car_color: car_color, plate_number: plate_number, checked_out: "No" });
    //     fs.writeFile(fileName, JSON.stringify(visiits), function(err) {
    //         if (err) return console.log(err);
    //     });
    // }

    res.redirect("/Visitors");
});

app.delete("/Visitors/:id", function(req, res) {
    var id = Number(req.params.id);
    visit_collection.deleteOne({ hostid: id }, function(err, result) {
        if (err) console.log(err)
    });


    // var visitss = JSON.parse(fs.readFileSync('./visits.json'));
    // for (var i = 0; i < visitss.length; i++) {
    //     var obj = visitss[i];

    //     if (obj.hostid == id) {
    //         visitss.splice(i, 1);
    //     }
    // }
    // fs.writeFile(fileName, JSON.stringify(visitss), function(err) {
    //     if (err) return console.log(err);
    // });
    res.redirect("/Visitors");
});

app.get("/Visitors", function(req, res) {
    visit_collection.find({}, function(err, visits) {
        if (err) console.log(err);
        else {
            // var visitJSON = fs.readFileSync('./visits.json');
            // var visits = JSON.parse(visitJSON);
            console.log(visits);
            res.render("Visitors.ejs", { visits: visits });
        }
    })
});



app.get("/check", function(req, res) {
    res.render("check.ejs");
});




app.put("/check", function(req, res) {
    var pin_ = req.body.pin;
    var current_status = null;
    var new_status = null;

    visit_collection.findOne({ pin: pin_ }, async function(err, ses) {
        if (err) return console.error(err);
        else {
            current_status = ses.checked_out;

            if (current_status == "Reserved") {
                new_status = "Inside";
            } else if (current_status == "Inside") {
                new_status = "Outside";
            } else {
                new_status = "Outside";
            }
            visit_collection.updateOne({ pin: pin_ }, {
                checked_out: new_status

            }, function(err) { if (err) return console.error(err); });

            var e_mail = null;
            await user_collection.findOne({ userid: ses.hostid }, function(err, eses) {
                if (err) return console.error(err);
                else if (!eses) {} else {
                    e_mail = eses.email;
                }
            });

            var mailOptions = {
                from: 'no.reply.vms.kfupm@gmail.com',
                to: 's201550190@kfupm.edu.sa,' + e_mail + '',
                subject: 'VMS Notification: Visit with PIN (' + ses.pin + ') Status',
                html: '<h1>Hi ' + ses.host + ",<br> The visitor " + ses.name + " is " + new_status + " KFUPM Campus.</h1>"
            };
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);

                }
            });
            res.render('checkinfo.ejs', {
                host: ses.host,
                hostid: ses.hostid,
                name: ses.name,
                name_nat_id: ses.name_nat_id,
                date: ses.date,
                time: ses.time,
                dtime: ses.dtime,
                destination: ses.destination,
                car_make: ses.car_make,
                car_model: ses.car_model,
                car_year: ses.car_year,
                car_color: ses.car_color,
                plate_number: ses.plate_number,
                pin: ses.pin,
                checked_out: new_status
            });

        }
    });

    // user_collection.findOne({ userid: requested_visit.hostid }, function(err, result) {
    //     if (err) console.log(err);
    //     else if (!result) {} else {
    //         requested_visit.email = result.email;
    //     }
    // });
    // console.log(requested_visit.email);
    // res.redirect("/Visitors");
});



app.put("/Visitors/:id", function(req, res) {
    var host = req.body.host;
    var RKID = req.body.hostid;
    var name = req.body.name;
    var name_natid = req.body.name_nat_id;
    var vdate = req.body.date;
    var vtime = req.body.time;
    var vdtime = req.body.dtime;
    var car_make = req.body.car_make;
    var car_model = req.body.car_model;
    var car_year = req.body.car_year;
    var car_color = req.body.car_color;
    var plate_number = req.body.plate_number;
    var destination = req.body.destination;
    // var visits = JSON.parse(fs.readFileSync('./visits.json'));
    visit_collection.updateOne({ hostid: RKID }, {
        hostid: RKID,
        host: host,
        name: name,
        name_nat_id: name_natid,
        date: vdate,
        time: vtime,
        dtime: vdtime,
        car_make: car_make,
        car_model: car_model,
        car_year: car_year,
        car_color: car_color,
        plate_number: plate_number,
        destination: destination,
    }, function(err) { if (err) return console.error(err); });


    // visits.forEach(function(visit) {
    //     if (visit.hostid == RKID) {
    //         visit.hostid = RKID;
    //         visit.host = host;
    //         visit.name = name;
    //         visit.name_nat_id = name_natid;
    //         visit.date = vdate;
    //         visit.time = vtime;
    //         visit.dtime = vdtime;
    //         visit.car_make = car_make;
    //         visit.car_model = car_model;
    //         visit.car_year = car_year;
    //         visit.car_color = car_color;
    //         visit.plate_number = plate_number;
    //         visit.destination = destination;
    //     }
    // });
    // fs.writeFile(fileName, JSON.stringify(visits), function(err) {
    //     if (err) return console.log(err);
    // });
    res.redirect("/Visitors");
});

app.get("/Visitors/:id/edit", function(req, res) {
    var id = req.params.id;
    var requested_visit = {};
    requested_visit.hostid = id;

    visit_collection.findOne({ hostid: id }, function(err, result) {
            if (err) console.log(err);
            else {
                requested_visit.hostid = result.hostid;
                requested_visit.host = result.host;
                requested_visit.name = result.name;
                requested_visit.name_nat_id = result.name_nat_id;
                requested_visit.date = result.date;
                requested_visit.time = result.time;
                requested_visit.dtime = result.dtime;
                requested_visit.car_make = result.car_make;
                requested_visit.car_model = result.car_model;
                requested_visit.car_year = result.car_year;
                requested_visit.car_color = result.car_color;
                requested_visit.plate_number = result.plate_number;
                requested_visit.destination = result.destination;
                res.render("edit_visit_request.ejs", { visits: requested_visit });
            }
        })
        // var visits = JSON.parse(fs.readFileSync('./visits.json'));
        // visits.forEach(function(visit) {
        //     if (visit.hostid == id) {
        //         requested_visit.hostid = visit.hostid;
        //         requested_visit.host = visit.host;
        //         requested_visit.name = visit.name;
        //         requested_visit.name_nat_id = visit.name_nat_id;
        //         requested_visit.date = visit.date;
        //         requested_visit.time = visit.time;
        //         requested_visit.dtime = visit.dtime;
        //         requested_visit.car_make = visit.car_make;
        //         requested_visit.car_model = visit.car_model;
        //         requested_visit.car_year = visit.car_year;
        //         requested_visit.car_color = visit.car_color;
        //         requested_visit.plate_number = visit.plate_number;
        //         requested_visit.destination = visit.destination;
        //     }
        // });
        // res.render("edit_visit_request.ejs", { visit: requested_visit });
});

app.get("/Visitors/:id", function(req, res) {
    var id = req.params.id;

    visit_collection.find({ hostid: id }, function(err, visitsss) {
        if (err) {
            console.log(err);

        } else if (!visitsss) {
            // res.render("show_visit_request.ejs");
        } else {
            res.render("show_visit_request.ejs", { visits: visitsss });
        }
    })


    // var visits = JSON.parse(fs.readFileSync('./visits.json'));
    // var host, hostid, name, name_nat_id, date, time, dtime, car_make, car_model, car_year, car_color, plate_number, destination, checked_out;
    // visits.forEach(function(visit) {
    //     if (visit.hostid == id) {
    //         hostid = visit.hostid;
    //         host = visit.host;
    //         name = visit.name;
    //         name_nat_id = visit.name_nat_id;
    //         date = visit.date;
    //         time = visit.time;
    //         dtime = visit.dtime;
    //         car_make = visit.car_make;
    //         car_model = visit.car_model;
    //         car_year = visit.car_year;
    //         car_color = visit.car_color;
    //         plate_number = visit.plate_number;
    //         destination = visit.destination;
    //         checked_out = visit.checked_out;

    //     }
    // });
    // res.render("show_visit_request.ejs", {
    //     host: host,
    //     hostid: hostid,
    //     name: name,
    //     name_nat_id: name_nat_id,
    //     date: date,
    //     time: time,
    //     dtime: dtime,
    //     destination: destination,
    //     car_make: car_make,
    //     car_model: car_model,
    //     car_year: car_year,
    //     car_color: car_color,
    //     plate_number: plate_number,
    //     checked_out: checked_out,
    // });
});