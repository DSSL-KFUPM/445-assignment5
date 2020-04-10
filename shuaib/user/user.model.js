const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

const schema = new Schema({
  username: { type: String, unique: true, required: true },
  hash: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  userrole: { type: String, required: true },
  createdDate: { type: Date, default: Date.now },
});

// plugin for passport-local-mongoose
schema.plugin(passportLocalMongoose);

schema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", schema);
