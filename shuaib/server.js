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
  saveUninitialized: false,
});

const emailHander = require("./helpers/email-handler");

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
app.listen(2000, function () {
  console.log("Server is running");
  //app.use(express.static('HW1') );
});

// get method to load the login page
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});

// get method to load the login page
app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});

// get method to logout and load the login page
app.get("/logout", function (req, res) {
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

    req.logIn(user, function (err) {
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
app.get("/register", function (req, res) {
  res.sendFile(__dirname + "/registration.html");
});

// Post method to register user
app.post("/register", (req, res, next) => {
  UserDetails.register(req.body, req.body.password)
    .then((resp) => {
      console.log("Registration resp:" + resp);
      res.redirect("/");
    })
    .catch((err) => {
      console.log("Registration Err::" + err);
      window.alert(err);
    });
});

/*
  Vistor's realted code will start from here
*/

// Function to load the visitors home page
app.get("/visitors/:name", connectEnsureLogin.ensureLoggedIn(), function (
  req,
  res
) {
  console.log("Visitors Home page loaded");
  visitorService
    .getVisitorsByName(req.params.name)
    .then((users) => {
      console.log("visitor page :: " + users);
      res.render("visitor.ejs", {
        visitors: users != undefined ? users : [],
        userName: req.params.name.toString().trim(),
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Function to load the new visitor entry page
app.post("/visitors", connectEnsureLogin.ensureLoggedIn(), function (req, res) {
  console.log(req.body);
  req.body.name = req.body.name.toString().trim();
  req.body.token_no = Math.floor(Math.random() * 1000000);
  visitorService
    .create(req.body)
    .then((resp) => {
      emailHander.sendMail(
        "Visit created for " + req.body.name,
        "Please use the token number " + req.body.token_no + ".",
        req.body.email
      );
      visitorService
        .getAll()
        .then((users) => {
          console.log(users);
          res.redirect("/visitors/" + req.body.name);
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

// ---------------------------------------------for residents--------------------------------

/*
  Residents's realted code will start from here
*/

// Function to load the residents home page
app.get("/residents", connectEnsureLogin.ensureLoggedIn(), function (req, res) {
  console.log("Residents Home page loaded");
  res.sendFile(__dirname + "/resident.html");
});

// Function to load the visitors home page
app.get("/residents/:name", connectEnsureLogin.ensureLoggedIn(), function (
  req,
  res
) {
  console.log("Residents Home page loaded");
  visitorService
    .getVisitorsByHost(req.params.name)
    .then((users) => {
      console.log(users);
      if (users == undefined) users = [];
      res.render("resident.ejs", {
        residents: users,
        userName: req.params.name,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Function to load the new visitor entry page
app.post("/residents", connectEnsureLogin.ensureLoggedIn(), function (
  req,
  res
) {
  console.log(req.body);
  req.body.name = req.body.name.toString().trim();
  req.body.host = req.body.host.toString().trim();
  req.body.token_no = Math.floor(Math.random() * 1000000);
  visitorService
    .create(req.body)
    .then((resp) => {
      console.log(resp);
      emailHander.sendMail(
        "Visit created for " + req.body.name,
        "Please use the token number " + req.body.token_no + ".",
        req.body.email
      );
      visitorService
        .getAll()
        .then((users) => {
          console.log(users);
          res.redirect("/residents/" + req.body.host);
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Functions related to Security
app.get("/security", connectEnsureLogin.ensureLoggedIn(), function (req, res) {
  console.log("Security file :P");
  var previousVisits = [],
    currentVisits = [];
  visitorService
    .currentVisitors()
    .then((currVisits) => {
      currentVisits = currVisits;
      visitorService
        .previousVisitors()
        .then((preVisits) => {
          previousVisits = preVisits;
          res.render("security.ejs", {
            previousVisits: previousVisits,
            currentVisits: currentVisits,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/check", function (req, res) {
  res.render("check.ejs", {});
});

app.post("/search", function (req, res) {
  visitorService
    .searchVisitByToken(req.body.token.toString().trim())
    .then((visits) => {
      if (visits.length > 0) {
        if (visits[0].checked_in === "NO") {
          visitorService
            .checkInVisit(visits[0]._id)
            .then((resp) => {
              emailHander.sendMail(
                "Visit Checkin :: Token NO:" + visits[0].token_no,
                "Visitor " + visits[0].name + " is Checked in.",
                visits[0].email
              );
              res.render("message.ejs", {
                message: "You are checked in successfully",
              });
            })
            .catch((err) => {
              console.log(err);
            });
        } else if (visits[0].checked_out === "NO") {
          visitorService
            .checkoutVisit(visits[0]._id)
            .then((resp) => {
              emailHander.sendMail(
                "Visit Checkout :: Token NO:" + visits[0].token_no,
                "Visitor " + visits[0].name + " is Checked out.",
                visits[0].email
              );
              res.render("message.ejs", {
                message: "You are checked out successfully",
              });
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          res.render("message.ejs", {
            message: "Visitor is already checked out",
          });
        }
      } else {
        res.render("message.ejs", {
          message: "Token not found",
        });
      }
    });
});

// Checkout the visit
app.get("/security/:id", connectEnsureLogin.ensureLoggedIn(), function (
  req,
  res
) {
  visitorService
    .checkoutVisit(req.params.id)
    .then((resp) => {
      res.redirect("/security");
    })
    .catch((err) => {
      console.log(err);
    });
});

// Function to load the new visitor entry page
app.post("/security/search", connectEnsureLogin.ensureLoggedIn(), function (
  req,
  res
) {
  console.log(req.body);
  visitorService
    .searchVisitByToken(req.body.token.toString().trim())
    .then((visits) => {
      console.log(visits);
      if (visits.length > 0) {
        res.render("security-checkinout.ejs", {
          visitor: visits[0],
          buttonTitle:
            visits[0].checked_in == "NO"
              ? "Check in"
              : visits[0].checked_out == "NO"
              ? "Check out"
              : "Return",
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
app.post(
  "/security/check-in-out",
  connectEnsureLogin.ensureLoggedIn(),
  function (req, res) {
    console.log(req.body);
    var visit = req.body;
    if (visit.checked_in === "NO") {
      visitorService
        .checkInVisit(visit._id)
        .then((resp) => {
          emailHander.sendMail(
            "Visit Checkin :: Token NO:" + visit.token_no,
            "Visitor " + visit.name + " is Checked in.",
            visit.email
          );
          res.render("message.ejs", {
            message: "Checked in successfully",
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (visit.checked_out === "NO") {
      visitorService
        .checkoutVisit(visit._id)
        .then((resp) => {
          emailHander.sendMail(
            "Visit Checkout :: Token NO:" + visit.token_no,
            "Visitor " + visit.name + " is Checked out.",
            visit.email
          );
          res.render("message.ejs", {
            message: "Checked out successfully",
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      res.redirect("/security");
    }
  }
);

// Register new user to system
app.get("/import", function (req, res) {
  UserDetails.register(
    {
      username: "majid",
      name: "Majid Yazeed",
      userrole: "RESIDENT",
      email: "majid@vmsapp.com",
    },
    "password123"
  );
  UserDetails.register(
    {
      username: "yazeed",
      name: "Saeed Yazeed",
      userrole: "SECURITY",
      email: "yazeed@vmsapp.com",
    },
    "password123"
  );
  UserDetails.register(
    {
      username: "saeed",
      name: "Saeed Saad",
      userrole: "VISITOR",
      email: "saeed@vmsapp.com",
    },
    "password123"
  );
  res.redirect("/");
});

// Email API
app.get("/email", function (req, res) {
  emailHander.sendMail();
});
