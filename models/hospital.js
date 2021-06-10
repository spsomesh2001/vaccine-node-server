const mongoose = require("mongoose");

const hospitalSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  h_id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
    required: true,
  },
  cs : {
    type: String,
    required: true
  },
  pincode: {
    type: Number,
    required: true,
    match: /(^\d{6}$)/,
  },
  records: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("Hospital", hospitalSchema);