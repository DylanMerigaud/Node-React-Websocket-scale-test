var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var message = new Schema({
  content: String,
  author: String,
  date: Date
});

module.exports = mongoose.model("Messages", message);
