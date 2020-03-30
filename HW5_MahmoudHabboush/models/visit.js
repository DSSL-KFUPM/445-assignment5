const mongoose = require('mongoose');
 
var visitSchema = new mongoose.Schema({
  host: String,
  destination: String,
  date: String,
  time: String,
  maker: String,
  model: String,
  year: String,
  plate: String,
  visitor: String,
  checkedout: String,
  code: Number,
  owner: String,
  hostEmail: String
});
visitSchema.pre('save', function(next) {
  this.code = parseInt(Number("0x"+String(this._id).substring(2,9)), 10);
  next();
});

module.exports = mongoose.model('Visits', visitSchema);
