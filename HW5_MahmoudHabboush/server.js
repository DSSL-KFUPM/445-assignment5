const express = require('express');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var session = require('express-session')
const DATABASE_URL = 'mongodb://localhost:27017/VMS';

const app = express()
  .set('view engine', 'ejs')
  .use(methodOverride("_method"))
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(express.static("public"))
  .use(session({ secret: 'HW4', resave: true, saveUninitialized: false }))
  .use(passport.initialize())
  .use(passport.session());

mongoose.connect(DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });

const User = require('./models/user');
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var visits = require('./models/visit');
//Root
app.get('/', checkAuthenticated, (req, res) => {
  res.redirect('/' + req.user.type);
});
//Entities routes
app.get('/resident', checkAuthenticated, (req, res) => {
  if (req.user.type != 'resident')
    res.redirect('/' + req.user.type);
  else
    res.render('resident', { name: req.user.name, email: req.user.email })
});
app.get('/visitor', checkAuthenticated, (req, res) => {
  if (req.user.type != 'visitor')
    res.redirect('/' + req.user.type);
  else
    res.render('visitor', { name: req.user.name, email: req.user.email })
});
app.get('/security', checkAuthenticated, (req, res) => {
  if (req.user.type != 'security')
    res.redirect('/' + req.user.type);
  else {
    visits.find({}, (err, visitList) => {
      if (err) console.log("failed to get visit list");
      else
        res.render('security', { name: req.user.name, email: req.user.email, visits: visitList })
    });
  }
});
//Register logic
app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register', { e_msg: '', expand: false });
});
app.post('/register', function (req, res) {
  e = req.body.email; n = req.body.name; p = req.body.password; c = req.body.confirm; t = req.body.type.toLowerCase();
  if (n == '')
    return res.render('register', { e_msg: 'Name cannot be empty', expand: true })
  if (p == '')
    return res.render('register', { e_msg: "Password cannot be empty", expand: true });
  if (p != c)
    return res.render('register', { e_msg: "Passwords don't match", expand: true });
  if (t != 'resident' && t != 'visitor' && t != 'security')
    return res.render('register', { e_msg: "invalid type", expand: true });
  User.register(new User({ email: e, type: t, name: n }), p, function (err, user) {
    if (err) {
      res.render('register', { e_msg: "Email is already used", expand: true });
      console.log(err);
    }
    else passport.authenticate('local')(req, res, () => {
      res.redirect('/');
    });
  });
});
//Login logic
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login');
});
app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
}));
//Checking logic
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
//signout
app.get('/signout', checkAuthenticated, (req, res) => {
  req.logOut()
  res.redirect('/')
})

//RESTFULL ROUTES
//1
app.get('/visits', checkAuthenticated, function (req, res) {
  if (req.user.type == 'security')
    res.send("You don't have privilege");
  else {
    visits.find({}, (err, visitList) => {
      if (err) console.log("failed to get visit list");
      else {
        res.render("visits", { type: req.user.type, visits: visitList.filter(x => x.owner == req.user._id), name: req.user.name });
      }
    });
  }
});
//2
app.get("/visits/new", checkAuthenticated, function (req, res) {
  if (req.user.type == 'security')
    res.send("You don't have privilege");
  else
    res.render("newVisit", { type: req.user.type, email: req.user.email, name: req.user.name });
});
//3
app.post('/visits', checkAuthenticated, function (req, res) {
  if (req.user.type == 'security')
    res.send("You don't have privilege");
  else {
    const v = req.body;
    v.checkedout = "YES";
    v.owner = req.user._id;
    if (req.user.type == 'resident') {
      v.host = req.user.name;
      v.hostEmail = req.user.email;
    }
    else
      v.visitor = req.user.name
    var newVisit = new visits(v);
    newVisit.save((err, visit) => {
      if (err) console.log(err)
      else res.redirect("/");
    });
  }
});
//4
app.get("/visits/:id", checkAuthenticated, function (req, res) {
  var id = req.params.id;
  visits.findById(id, (err, visit) => {
    if (err || visit == null) res.send("ID is not valid");
    else if (visit.owner != req.user._id && req.user.type != 'security') res.send("You don't have privilege");
    else res.render("visitInfo", { visit: visit, type: req.user.type });
  });
});
//5
app.get("/visits/:id/edit", checkAuthenticated, function (req, res) {
  var id = req.params.id;
  visits.findById(id, (err, visit) => {
    if (err || visit == null) res.send("ID is not valid");
    else if (visit.owner != req.user._id) res.send("You don't have privilege");
    else res.render("editVisit", { visit: visit, type: req.user.type });
  });
});
//6
app.put("/visits/:id", checkAuthenticated, function (req, res) {
  var id = req.params.id;
  const visit = req.body;
  var test = true;
  for (var d in visit)
    if (visit[d] == '') {
      test = false;
      break;
    }
  if (test)
    visits.findById(id, (err, doc) => {
      if (err || doc == null)
        res.send("ID is not valid");
      if (doc.owner != req.user._id)
        res.send("You don't have privilege");
      else {
        if (req.user.type == 'resident')
          doc.visitor = visit.visitor;
        else {
          doc.host = visit.host;
          doc.hostEmail = visit.hostEmail
        }
        doc.destination = visit.destination;
        doc.date = visit.date;
        doc.time = visit.time;
        doc.maker = visit.maker;
        doc.model = visit.model;
        doc.year = visit.year;
        doc.plate = visit.plate;
        doc.save((err, ndoc) => {
          if (err) res.redirect("/visits/" + id + "/edit")
          else res.redirect("/");
        });
      }
    });
  else
    res.redirect("/visits/" + id + "/edit")
});
//7
app.delete("/visits/:id", checkAuthenticated, function (req, res) {
  var id = req.params.id;
  visits.findById(id, 'owner', (err, doc) => {
    if (err || doc == null)
      res.send("Id is not valid")
    else if (doc.owner != req.user._id)
      res.send("You don't have privilege")
    else {
      visits.findByIdAndDelete(id, (err) => {
        if (err) res.redirect("/visits/" + id + "/edit");
        else res.redirect("/");
      });
    }
  });
});
//switch status for security
app.put("/visits/:id/switch", checkAuthenticated, function (req, res) {
  if (req.user.type != 'security')
    res.send("You don't have privilege");
  var id = req.params.id;
  visits.findById(id, 'checkedout', (err, doc) => {
    if (err) res.send("Internal error, please try again");
    else {
      doc.checkedout = doc.checkedout == "YES" ? "NO" : "YES"
      doc.save((err, ndoc) => {
        if (err) res.send("Internal error, please try again");
        else res.redirect('/');
      });
    }
  });
});
//quick switch
app.get("/check", function (req, res) {
  res.render("check.ejs");
});
app.put("/check", function (req, res) {
  const code = Number(req.body.code);
  visits.findOneAndUpdate({code:code}, 'checkedout', (err, v) => {
    if (err) res.send({"msg":"err"});
    else {
      if(v == null)
        res.send({"msg":"err"});
      else {
        v.checkedout = v.checkedout == "YES" ? "NO" : "YES"
        v.save((err, nv) => {
          if (err) res.send({"msg":"err"});
          else res.send({"msg":"done", "hostEmail":nv.hostEmail, "status": nv.checkedout, "plate":nv.plate, "host":nv.host, "visitor":nv.visitor});
        });
    }
    }
  });
});
//Start server
app.listen(3000, function () {
  console.log("Listening on port 3000");
});
