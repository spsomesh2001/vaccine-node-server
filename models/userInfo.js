const mongoose = require("mongoose");

const addressSchema = mongoose.Schema({
  _id: {
    id: false,
  },
  house: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  town: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
});

const memberSchema = mongoose.Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  dob: {
    type: String,
    required: true,
  },
  relation: {
    type: String,
    required: true,
  },
  aadhar: {
    type: String,
    required: true,
    match: [/^[2-9]{1}[0-9]{3}\\s[0-9]{4}\\s[0-9]{4}$/, "Not matched"],
  },
});

const userInfoSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match:
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
  },
  gender: {
    type: String,
    required: true,
  },
  dob: {
    type: String,
    required: true,
  },
  address: {
    type: [addressSchema, "address not matched"],
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  aadhar: {
    type: String,
    required: true,
    match: [/^[2-9]{1}[0-9]{3}\s{1}[0-9]{4}\s{1}[0-9]{4}$/, "Not matched"],
  },
  members: {
    type: Array,
    default: [],
  },
  photoFile: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

module.exports = mongoose.model("UserInfo", userInfoSchema);
