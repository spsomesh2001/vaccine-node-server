const mongoose = require("mongoose");

const aadharSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  aadhar: {
    type: String,
    required: true,
    unique:true,
    match: [/^[2-9]{1}[0-9]{3}\s{1}[0-9]{4}\s{1}[0-9]{4}$/, "Not matched"],
  },
});

module.exports = mongoose.model("Aadhar", aadharSchema);
