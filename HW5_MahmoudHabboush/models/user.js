const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const User = new mongoose.Schema({
  email: String,
  type: String,
  name: String,
});

User.plugin(passportLocalMongoose, { usernameField: 'email' });
module.exports = mongoose.model('User', User);
