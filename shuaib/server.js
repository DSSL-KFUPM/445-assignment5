var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var methodOverride = require("method-override");

// =============================================================================
require("rootpath")();
const cors = require("cors");
const errorHandler = require("helpers/error-handler");

const expressSession = require("express-session")({
  secret: "secret",
  resave: false,
  saveUninitialized: false
});

const visitorService = require("./visitor/visitor.service");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(expressSession);

app.use(express.static("public"));
app.use(methodOverride("_method"));

/*  PASSPORT SETUP  */
const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());

/* PASSPORT LOCAL AUTHENTICATION */
const UserDetails = require("./user/user.model");
passport.use(UserDetails.createStrategy());

passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

// global error handler
app.use(errorHandler);

const connectEnsureLogin = require("connect-ensure-login");

// api routes
app.listen(2000, function() {
  console.log("Server is running");
  //app.use(express.static('HW1') );
});

// get method to load the login page
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/login.html");
});

// get method to load the login page
app.get("/login", function(req, res) {
  res.sendFile(__dirname + "/login.html");
});

// get method to logout and load the login page
app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/login");
});

// post method to login to app
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.redirect("/login?info=" + info);
    }

    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }

      if (user.userrole === "VISITOR") {
        return res.redirect("/visitors/" + user.name);
      } else if (user.userrole === "RESIDENT") {
        return res.redirect("/residents/" + user.name);
      } else if (user.userrole === "SECURITY") {
        return res.redirect("/security");
      }
    });
  })(req, res, next);
});

// get method to load the registration page
app.get("/register", function(req, res) {
  res.sendFile(__dirname + "/registration.html");
});

// Post method to register user
app.post("/register", (req, res, next) => {
  UserDetails.register(req.body, req.body.password)
    .then(resp => {
      console.log("Registration resp:" + resp);
      res.redirect("/");
    })
    .catch(err => {
      console.log("Registration Err::" + err);
      alert(err);
    });
});

/*
  Vistor's realted code will start from here
*/

// Function to load the visitors home page
app.get("/visitors/:name", connectEnsureLogin.ensureLoggedIn(), function(
  req,
  res
) {
  console.log("Visitors Home page loaded");
  visitorService
    .getVisitorsByName(req.params.name)
    .then(users => {
      console.log("visitor page :: " + users);
      res.render("visitor.ejs", {
        visitors: users != undefined ? users : [],
        userName: req.params.name.toString().trim()
      });
    })
    .catch(err => {
      console.log(err);
    });
});

// Function to load the new visitor entry page
app.post("/visitors", connectEnsureLogin.ensureLoggedIn(), function(req, res) {
  console.log(req.body);
  req.body.name = req.body.name.toString().trim();
  visitorService
    .create(req.body)
    .then(resp => {
      console.log(resp);
      visitorService
        .getAll()
        .then(users => {
          console.log(users);
          res.redirect("/visitors/" + req.body.name);
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
});

// ---------------------------------------------for residents--------------------------------

/*
  Residents's realted code will start from here
*/

// Function to load the residents home page
app.get("/residents", connectEnsureLogin.ensureLoggedIn(), function(req, res) {
  console.log("Residents Home page loaded");
  res.sendFile(__dirname + "/resident.html");
});

// Function to load the visitors home page
app.get("/residents/:name", connectEnsureLogin.ensureLoggedIn(), function(
  req,
  res
) {
  console.log("Residents Home page loaded");
  visitorService
    .getVisitorsByHost(req.params.name)
    .then(users => {
      console.log(users);
      if (users == undefined) users = [];
      res.render("resident.ejs", {
        residents: users,
        userName: req.params.name
      });
    })
    .catch(err => {
      console.log(err);
    });
});

// Function to load the new visitor entry page
app.post("/residents", connectEnsureLogin.ensureLoggedIn(), function(req, res) {
  console.log(req.body);
  req.body.name = req.body.name.toString().trim();
  visitorService
    .create(req.body)
    .then(resp => {
      console.log(resp);
      visitorService
        .getAll()
        .then(users => {
          console.log(users);
          res.redirect("/residents/" + req.body.name);
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
});

// Functions related to Security
app.get("/security", connectEnsureLogin.ensureLoggedIn(), function(req, res) {
  console.log("Security file :P");
  var previousVisits = [],
    currentVisits = [];
  visitorService
    .currentVisitors()
    .then(currVisits => {
      currentVisits = currVisits;
      visitorService
        .previousVisitors()
        .then(preVisits => {
          previousVisits = preVisits;
          res.render("security.ejs", {
            previousVisits: previousVisits,
            currentVisits: currentVisits
          });
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
});

// Checkout the visit
app.get("/security/:id", connectEnsureLogin.ensureLoggedIn(), function(
  req,
  res
) {
  visitorService
    .checkoutVisit(req.params.id)
    .then(resp => {
      res.redirect("/security");
    })
    .catch(err => {
      console.log(err);
    });
});

// Register new user to system
app.get("/import", function(req, res) {
  UserDetails.register(
    {
      username: "majid",
      name: "Majid Yazeed",
      userrole: "RESIDENT",
      mobile: "1234567890"
    },
    "password123"
  );
  UserDetails.register(
    {
      username: "yazeed",
      name: "Saeed Yazeed",
      userrole: "SECURITY",
      mobile: "1234567891"
    },
    "password123"
  );
  UserDetails.register(
    {
      username: "saeed",
      name: "Saeed Saad",
      userrole: "VISITOR",
      mobile: "1234567892"
    },
    "password123"
  );
  res.redirect("/");
});
