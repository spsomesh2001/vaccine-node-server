const mongoose = require("mongoose");

const vaccineSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  p_id: mongoose.Schema.Types.ObjectId,
  vaccinelist: {
    type: Array,
    default: []
  }
});

module.exports = mongoose.model("Vaccine", vaccineSchema);