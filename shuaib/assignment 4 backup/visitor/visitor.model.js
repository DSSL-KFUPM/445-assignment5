const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  name: { type: String, required: true },
  host: { type: String, required: true },
  destination: { type: String, required: true },
  time: { type: String, required: true },
  date: { type: Date, default: Date.now },
  car_make: { type: String, required: true },
  car_model: { type: String, required: true },
  plate_number: { type: String, required: true },
  checked_out: { type: String, required: true, default: "NO" }
});

schema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Visitor", schema);
