const config = require("config.json");
const mongoose = require("mongoose");
const mongooseFindAndFilter = require("mongoose-find-and-filter");

mongoose.plugin(mongooseFindAndFilter);

mongoose.connect(process.env.MONGODB_URI || config.connectionString, {
  useCreateIndex: true,
  useNewUrlParser: true
});
mongoose.Promise = global.Promise;

module.exports = {
  User: require("../user/user.model"),
  Visitor: require("../visitor/visitor.model")
};
