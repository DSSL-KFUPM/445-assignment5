var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose')

//  var expressValidator = require('express-validator');

var app = express();
var port = 3001;
const path = require('path');
//var fileName = "./students.json";
//var file = require(fileName);
var methodOverride = require('method-override')

//mailer 
var nodeMailer = require('nodemailer')
var transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'VMStestEmail123456@gmail.com',
        pass: 'ABCBCA123654'
    }
});

//registration stuff
//app.use(expressValidator()); 


var userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    membership: String
})


var User = mongoose.model("users", userSchema);


// login stuff 

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const session = require('express-session');
var flash = require('connect-flash');

// Express session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//flash
app.use(flash());

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        console.log(req.user);
        return next();
    }
    //req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/login');
}

function forwardAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

// Global variables
app.use(function (req, res, next) {
    res.locals.error = req.flash('error');
    next();
});


passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password1'
    },
    function (username, password, done) {

        User.findOne({
            email: username
        }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {
                    message: 'That email is not registered'
                });
            }


            // Match password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Password incorrect'
                    });
                }
            });
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});







// finished login

// passport stuff



// end of passport



// mongo

const DATABASE_NAME = 'COE445';
const DATABASE_URL = 'mongodb://localhost:27017/COE445'

mongoose.connect(DATABASE_URL);

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var visitsSchema = new mongoose.Schema({
    id: String,
    host: String,
    name: String,
    date: String,
    time: String,
    destination: String,
    car_make: String,
    car_model: String,
    plate_number: String,
    checked_out: String,
    id: Number,
    check_in_num: Number,
    checked_in: String
})

var Visits = mongoose.model("visits", visitsSchema);

app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({
    extended: true
}));
//app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
//app.set('views', __dirname + '/views');
//app.use(express.static(__dirname));
app.use('/imgs', express.static(__dirname + "/imgs"));
app.use('/css', express.static(__dirname + "/css"));
app.use('/index', express.static(__dirname + "/views"));

app.listen(port, function () {
    console.log("Server is running at port " + port);
});


app.get('/', ensureAuthenticated, function (req, res) {
    console.log(req.user.membership);
    console.log(typeof (req.user.membership));
    res.render("HW1-Index.ejs", {
        membership: req.user.membership
    });
    // 	res.sendFile(path.join(__dirname+'/Index.html')).status(200);
});
app.get('/check-in', function (req, res) {


    res.render("HW4-Check-in.ejs", {
        errors: ""
    });
    // 	res.sendFile(path.join(__dirname+'/Index.html')).status(200);
});
app.post('/check-in', function (req, res) {
    console.log(req.body.chnumber)

    Visits.findOne({
        check_in_num: req.body.chnumber
    }, async function (err, visit) {
        //  console.log(allvisits);
        console.log("CHECKING IN")

        if (visit) {

            if (visit.checked_in == "YES") {
                return res.render("HW4-Check-in.ejs", {
                    errors: "This visit is already checked in"
                });
            }
            console.log(visit.checked_in)
            Visits.updateOne({
                check_in_num: req.body.chnumber
            }, {
                checked_in: "YES"
            }, function (err) {
                if (err) return console.error(err);
            });

            console.log(visit)
            //get visitor email
            var myhostmail = null;
            await User.findOne({
                name: visit.host
            }, function (err, host) {
                myhostmail = host.email;
                console.log(myhostmail);
            })
            var subject = "VMS: " + visit.name + " just checked-in"
            var text = "Dear " + visit.host + "\n Your visitor " + visit.name + " just checked-in \nHave a nice time \n <b>Automatic VMS email<\\b>"
            // mail the visitor here
            let mailOptions = {
                // should be replaced with real recipient's account
                from: 'VMStestEmail123456@gmail.com',
                to: myhostmail,
                subject: subject,
                text: text
            };
            console.log(mailOptions);

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });


            return res.render("HW4-Check-in.ejs", {
                errors: "Success"
            });
        }
        res.render("HW4-Check-in.ejs", {
            errors: "Bad check-in number"
        });


    })

});

// i am so tired of editing the data over and over
// i will just use the name of the user as a + authintication on his visit...
// anyway there is a public check in so this acctually shouldn't matter much 
app.post('/visits/check-in', function (req, res) {
    if (req.user.membership == "Visitor") {

        console.log(req.body)

        console.log(req.body.chnumber)
        var students = ""

        Visits.find({
            name: req.user.name
        }, function (err, allvisits) {
            //  console.log(allvisits);
            students = allvisits;

        })

        Visits.findOne({
            check_in_num: req.body.chnumber,
            name: req.user.name
        }, async function (err, visit) {
            //  console.log(allvisits);
            console.log("CHECKING IN")

            if (visit) {

                if (visit.checked_in == "YES") {
                    return res.render("HW3-visits.ejs", {
                        errors: "This visit is already checked in",
                        students,
                        id: false,
                        name: req.user.name
                    });
                }
                console.log(visit.checked_in)
                Visits.updateOne({
                    check_in_num: req.body.chnumber
                }, {
                    checked_in: "YES"
                }, function (err) {
                    if (err) return console.error(err);
                });
                console.log(visit)


                var myhostmail = null;
                await User.findOne({
                    name: visit.host
                }, function (err, host) {
                    myhostmail = host.email;
                    console.log(myhostmail);
                })
                var subject = "VMS: " + visit.name + " just checked-in"
                var text = "Dear " + visit.host + "\n Your visitor " + visit.name + " just checked-in \nHave a nice time \n <b>Automatic VMS email<\\b>"
                // mail the visitor here
                let mailOptions = {
                    // should be replaced with real recipient's account
                    from: 'VMStestEmail123456@gmail.com',
                    to: myhostmail,
                    subject: subject,
                    text: text
                };
                console.log(mailOptions);

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });

                return res.render("HW3-visits.ejs", {
                    errors: "Success",
                    students,
                    id: false,
                    name: req.user.name
                });
            }
            res.render("HW3-visits.ejs", {
                errors: "Bad check-in number",
                students,
                id: false,
                name: req.user.name
            });


        })

    } else {
        res.redirect("/");
    }
});


app.post('/security/check-in', function (req, res) {
    if (req.user.membership == "Security") {
        console.log(req.body)
        console.log(req.body.mynumber)
        var students = ""
        Visits.find({}, function (err, allvisits) {
            //  console.log(allvisits);
            students = allvisits;

        })

        if (req.body.hasOwnProperty("in")) {
            console.log("butt1 clicked");
            Visits.findOne({
                check_in_num: req.body.mynumber,
            },async function (err, visit) {
                //  console.log(allvisits);
                console.log("CHECKING IN")

                if (visit) {

                    if (visit.checked_in == "YES") {
                        return res.render("HW1-security.ejs", {
                            errors: "This visit is already checked in",
                            students
                        });
                    }
                    console.log(visit.checked_in)
                    Visits.updateOne({
                        check_in_num: req.body.mynumber
                    }, {
                        checked_in: "YES"
                    }, function (err) {
                        if (err) return console.error(err);
                    });
                    console.log(visit)

                    var myhostmail = null;
                    await User.findOne({
                        name: visit.host
                    }, function (err, host) {
                        myhostmail = host.email;
                        console.log(myhostmail);
                    })
                    var subject = "VMS: " + visit.name + " just checked-in"
                    var text = "Dear " + visit.host + "\n Your visitor " + visit.name + " just checked-in \nHave a nice time \n <b>Automatic VMS email<\\b>"
                    // mail the visitor here
                    let mailOptions = {
                        // should be replaced with real recipient's account
                        from: 'VMStestEmail123456@gmail.com',
                        to: myhostmail,
                        subject: subject,
                        text: text
                    };
                    console.log(mailOptions);

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                    return res.render("HW1-security.ejs", {
                        errors: "Success",
                        students
                    });
                }
                res.render("HW1-security.ejs", {
                    errors: "Bad check-in number",
                    students
                });


            })
        } else {
            console.log("butt2 clicked");
            Visits.findOne({
                check_in_num: req.body.mynumber,
            }, async function (err, visit) {
                //  console.log(allvisits);
                console.log("CHECKING OUT")

                if (visit) {

                    if (visit.checked_in == "YES") {

                        console.log(visit.checked_in)
                       await Visits.updateOne({
                            check_in_num: req.body.mynumber
                        }, {
                            checked_out: "YES"
                        }, function (err) {
                            if (err) return console.error(err);
                           
                        });
                            return await res.render("HW1-security.ejs", {
                                errors: "Success",
                                students
                            });
                      



                    } else {
                    res.render("HW1-security.ejs", {
                        errors: "Not checked-in",
                        students
                    });
                }

            }})

        }





    } else {
        res.redirect("/")
    }


});
app.get('/login', forwardAuthenticated, function (req, res) {
    res.render("HW4-login.ejs");
    // 	res.sendFile(path.join(__dirname+'/Index.html')).status(200);
});

app.post('/login', forwardAuthenticated, (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

app.get('/logout', ensureAuthenticated, function (req, res) {
    req.logout();
    res.redirect("/login");
    // 	res.sendFile(path.join(__dirname+'/Index.html')).status(200);
});

app.get('/register', forwardAuthenticated, function (req, res) {
    res.render("HW4-register.ejs", {
        errors: []
    });
    // 	res.sendFile(path.join(__dirname+'/Index.html')).status(200);
});


// registration !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
app.post('/register', forwardAuthenticated, function (req, res) {
    var {
        name,
        email,
        password1,
        password2,
        inlineRadioOptions
    } = req.body;
    //    var email = req.body.email;
    //    var password1 = req.body.password1;
    //    var password2 = req.body.password1;
    //    var membership = req.body.inlineRadioOptions;
    console.log(name);
    console.log(email);
    console.log(password1);
    console.log(password2);
    console.log(inlineRadioOptions);

    var errors = [];

    if (!inlineRadioOptions || !email || !password1 || !password2 || !name) {
        errors.push({
            msg: 'Please enter all fields'
        });
    }
    if (password1 != password2) {
        errors.push({
            msg: 'Passwords do not match'
        });
    }

    if (errors.length > 0) {
        res.render('HW4-register.ejs', {
            errors
        });
    } else {
        // after checking

        User.findOne({
            email: email
        }).then(user => {
            if (user) {
                errors.push({
                    msg: 'Email already exists'
                });
                res.render('HW4-register.ejs', {
                    errors
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password: password1,
                    membership: inlineRadioOptions
                });
                console.log(newUser);
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => {
                                let msg = [{
                                    msg: "sucessfully registered"
                                }];
                                res.render("HW4-register.ejs", {
                                    errors: msg
                                });
                            })
                            .catch(err => console.log(err));
                    });
                });
            }
        });
    }




    console.log(errors);
    //	User.register(new User({username:req.body.username}), req.body.password, function(err,user){
    //		if(err) {
    //			console.log(err)
    //			return res.render('register')
    //		}
    //		passport.authenticate("lcoal")(req,res,function(){
    //			res.redirect('/students');
    //		})
    //	})
})

app.get('/visits', ensureAuthenticated, function (req, res) {
    if (req.user.membership == "Visitor") {
        Visits.find({
            name: req.user.name
        }, function (err, allvisits) {
            //  console.log(allvisits);
            res.render("HW3-visits.ejs", {
                students: allvisits,
                id: false,
                name: req.user.name
            })


        })
    } else {
        res.redirect("/");
    }
});
//app.get('clouds.jpg', function(req,res){
//    res.render("clouds.jpg");
//});

app.get('/visits/new', ensureAuthenticated, function (req, res) {
    if (req.user.membership == "Visitor") {
        res.render("HW3-visits-new.ejs", {
            state: false,
            id: false,
            name: req.user.name
        });
    } else {
        res.redirect("/");
    }
});
app.post('/visits', ensureAuthenticated, function (req, res) {

    // better to synchronize the request and the page update such that the page doesn't update untill we finish
    // uodating the database
    if (req.user.membership == "Visitor") {
        async function run() {
            var exists = false;

            var ch_in_num = Math.floor(100000 + Math.random() * 900000);
            console.log(ch_in_num)




            Visits.find({
                check_in_num: ch_in_num
            }, function (err, myvisit) {
                do {
                    if (myvisit == "") {
                        exists = true;
                    } else {
                        ch_in_num = Math.floor(100000 + Math.random() * 900000);
                    }


                } while (!exists);
                return console.log(myvisit);



            })
            //                
            //                 do{
            //                Visits.findOne({check_in_num: ch_in_num}, function (err, myvisit) {
            //                    if(err)  return console.log(err)
            //                    console.log(myvisit)
            //                    console.log("test")
            //
            //                    if ( myvisit == null){
            //                        exists = true;
            //                    }
            //                })
            //                
            //            } while(!exists);
            //    res.render("HW1-Index.ejs");
            var host = req.body.Vname;
            var name = req.user.name;
            var date = req.body.date;
            var time = req.body.time;
            var destination = req.body.Destination;
            var cmaker = req.body.cmaker;
            var cmodel = req.body.cmodel;
            var pn = req.body.pn;
            var checked_out = "NO"
            var newID = 0;
            await Visits.find({}).sort('-id').exec(function (err, max) {
                console.log(max);
                console.log("maaaaaaaaaaaaaaaaxx");
                console.log(max[0].id);
                newID = max[0].id + 1;

                var newVisit = new Visits({
                    host: host,
                    name: name,
                    date: date,
                    time: time,
                    destination: destination,
                    car_make: cmaker,
                    car_model: cmodel,
                    plate_number: pn,
                    checked_out: checked_out,
                    id: newID,
                    check_in_num: ch_in_num,
                    checked_in: "NO"
                })

                newVisit.save(function (err, student) {
                    if (err) console.log('Something went wrong')
                });

            });


            res.redirect("/visits")
        }
        run();
    } else {
        res.redirect("/");
    }
});



//app.post("/students", function(req,res){
//	// create stdudents 
//	// redirect 
//	var name = req.body.name;
//	var major = req.body.major;
//	var id = req.body.id;
//	if(name != undefined && major != undefined && id !=undefined){
//		var stuJSON = fs.readFileSync('./students.json');
//		var students = JSON.parse(stuJSON);
//		students.push({id: id, name: name, major:major});
//		fs.writeFile(fileName, JSON.stringify(students), function(err){
//			if(err) return console.log(err);
//		});	
//	}
//	
//	res.redirect("/HW3-visits.ejs");
//});
//
//
//









app.get('/visits/:id', ensureAuthenticated, function (req, res) {
    if (req.user.membership == "Visitor") {

        var id = Number(req.params.id);
        if (isNaN(id)) {
            return res.redirect("/visits")
        }
        Visits.find({
            id: id,
            name: req.user.name
        }, function (err, myvisit) {
            res.render("HW3-visits.ejs", {
                students: myvisit[0],
                id: true,
                name: req.user.name
            })

        })
    } else {
        res.redirect("/");
    }
});

app.get('/visits/:id/edit', ensureAuthenticated, function (req, res) {
    if (req.user.membership == "Visitor") {

        var id = Number(req.params.id);
        if (isNaN(id)) {
            return res.redirect("/visits")
        }
        Visits.find({
            id: id,
            name: req.user.name
        }, function (err, myvisit) {
            res.render("HW3-visits-new.ejs", {
                students: myvisit[0],
                id: id,
                state: true,
                name: req.user.name
            })

        });

    } else {
        res.redirect("/");
    }

});

// editing specific visist

app.put('/visits/:id', ensureAuthenticated, function (req, res) {
    if (req.user.membership == "Visitor") {

        var id = Number(req.params.id);
        var host = req.body.Vname;
        var name = req.user.name
        var date = req.body.date;
        var time = req.body.time;
        var destination = req.body.Destination;
        var cmaker = req.body.cmaker;
        var cmodel = req.body.cmodel;
        var pn = req.body.pn;
        var checked = "NO"

        Visits.updateOne({
            id: id,
            name: req.user.name
        }, {
            id: id,
            host: host,
            name: name,
            date: date,
            time: time,
            destination: destination,
            car_make: cmaker,
            car_model: cmodel,
            plate_number: pn,
            checked_out: checked
        }, function (err) {
            if (err) return console.error(err);
        });

        console.log("updated")

        res.redirect("/visits")
    } else {
        res.redirect("/");
    }
});


app.delete('/visits/:id', ensureAuthenticated, function (req, res) {
    if (req.user.membership == "Visitor") {

        var id = Number(req.params.id);
        Visits.deleteOne({
            id: id,
            name: req.user.name
        }, function (err, result) {
            if (err) console.log(err)
        });

        res.redirect("/visits")
    } else {
        res.redirect("/");
    }
});


// residents
app.get('/resident', ensureAuthenticated, function (req, res) {
    if (req.user.membership == "Resident") {

        Visits.find({
            host: req.user.name
        }, function (err, allvisits) {
            console.log(allvisits);
            res.render("HW3-resident.ejs", {
                students: allvisits,
                id: false,
                name: req.user.name
            })


        })
    } else {
        res.redirect("/");
    }
});
app.get('/resident/new', ensureAuthenticated, function (req, res) {
    if (req.user.membership == "Resident") {

        res.render("HW3-resident-new.ejs", {
            state: false,
            id: false,
            name: req.user.name
        });
    } else {
        res.redirect("/");
    }
});
app.post('/resident', ensureAuthenticated, function (req, res) {
    //    res.render("HW1-Index.ejs");


    // better to synchronize the request and the page update such that the page doesn't update untill we finish
    // uodating the database
    if (req.user.membership == "Resident") {

        async function run() {
            //    res.render("HW1-Index.ejs");

            var exists = false;

            var ch_in_num = Math.floor(100000 + Math.random() * 900000);
            console.log(ch_in_num)




            Visits.find({
                check_in_num: ch_in_num
            }, function (err, myvisit) {
                do {
                    if (myvisit == "") {
                        exists = true;
                    } else {
                        ch_in_num = Math.floor(100000 + Math.random() * 900000);
                    }


                } while (!exists);
                return console.log(myvisit);

            })

            var host = req.user.name;
            var name = req.body.Vname;
            var date = req.body.date;
            var time = req.body.time;
            var destination = req.body.Destination;
            var cmaker = req.body.cmaker;
            var cmodel = req.body.cmodel;
            var pn = req.body.pn;
            var checked = "NO"
            var newID = 0;
            await Visits.find({}).sort('-id').exec(function (err, max) {
                console.log("maaaaaaaaaaaaaaaaxx");
                console.log(max[0].id);
                newID = max[0].id + 1;
                console.log(newID);

                var newVisit = new Visits({
                    host: host,
                    name: name,
                    date: date,
                    time: time,
                    destination: destination,
                    car_make: cmaker,
                    car_model: cmodel,
                    plate_number: pn,
                    checked_out: checked,
                    id: newID,
                    check_in_num: ch_in_num,
                    checked_in: "NO"
                })

                newVisit.save(function (err, student) {
                    if (err) console.log('Something went wrong')
                });

            });


            res.redirect("/resident")
        }
        run();
    } else {
        res.redirect("/");
    }

});
app.get('/resident/:id', ensureAuthenticated, function (req, res) {
    if (req.user.membership == "Resident") {

        var id = Number(req.params.id);
        if (isNaN(id)) {
            return res.redirect("/resident")
        }
        Visits.find({
            id: id,
            host: req.user.name
        }, function (err, myvisit) {
            res.render("HW3-resident.ejs", {
                students: myvisit[0],
                id: true,
                name: req.user.name
            })

        })
    } else {
        res.redirect("/");
    }
});
app.get('/resident/:id/edit', ensureAuthenticated, function (req, res) {
    if (req.user.membership == "Resident") {

        var id = Number(req.params.id);
        if (isNaN(id)) {
            return res.redirect("/resident")
        }
        Visits.find({
            id: id,
            host: req.user.name
        }, function (err, myvisit) {
            res.render("HW3-resident-new.ejs", {
                students: myvisit[0],
                id: id,
                state: true,
                name: req.user.name
            })

        });
    } else {
        res.redirect("/");
    }

});
// updating 
app.put('/resident/:id', ensureAuthenticated, function (req, res) {
    if (req.user.membership == "Resident") {

        var id = Number(req.params.id);
        if (isNaN(id)) {
            return res.redirect("/resident")
        }
        var host = req.user.name;
        var name = req.body.Vname;
        var date = req.body.date;
        var time = req.body.time;
        var destination = req.body.Destination;
        var cmaker = req.body.cmaker;
        var cmodel = req.body.cmodel;
        var pn = req.body.pn;
        var checked = "NO"


        Visits.updateOne({
            id: id,
            host: req.user.name
        }, {
            id: id,
            host: host,
            name: name,
            date: date,
            time: time,
            destination: destination,
            car_make: cmaker,
            car_model: cmodel,
            plate_number: pn,
            checked_out: checked
        }, function (err) {
            if (err) return console.error(err);
        });

        console.log("updated")

        res.redirect("/resident")
    } else {
        res.redirect("/");
    }
});

app.delete('/resident/:id', ensureAuthenticated, function (req, res) {
    if (req.user.membership == "Resident") {

        var id = Number(req.params.id);
        if (isNaN(id)) {
            return res.redirect("/resident")
        }
        Visits.deleteOne({
            id: id,
            host: req.user.name
        }, function (err, result) {
            if (err) console.log(err)
        });
        res.redirect("/resident")
    } else {
        res.redirect("/");
    }
});


// security 
app.get('/security', ensureAuthenticated, function (req, res) {
    if (req.user.membership == "Security") {

        Visits.find({}, function (err, allvisits) {
            console.log(allvisits);
            res.render("HW1-security.ejs", {
                students: allvisits
            })

        })
    } else {
        res.redirect("/");
    }
});
