const mongoose = require("mongoose");

const User = require("../models/user");
const UserInfo = require("../models/userInfo");
const Vaccine = require("../models/vaccine");
const Aadhar = require("../models/aadhar");

const axios = require("axios");
const api = axios.create({
  baseURL: "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public",
});

exports.getProfile = async (req, res) => {
  const _id = new mongoose.Types.ObjectId(req.userId);
  // console.log("User ID => ", _id);

  try {
    const formStatus = await User.findOne({ _id });
    // console.log("Form => ", formStatus);
    if (!formStatus) {
      return res
        .status(200)
        .json({ message: "Got User Profile", fStatus: formStatus.formFilled });
    }

    const usr = await UserInfo.findOne({ _id });
    // console.log("User => ", !usr);

    if (!usr) {
      return res
        .status(200)
        .json({ message: "Got User Profile", fStatus: formStatus.formFilled });
    }
    const existingRecord = await Vaccine.findOne({ p_id: _id });
    // console.log("Existing record => ", existingRecord);

    if (!existingRecord) {
      return res.status(200).json({
        message: "Got User Profile",
        userInfo: usr,
        fStatus: formStatus.formFilled,
      });
    }

    res.status(200).json({
      message: "Got User Profile",
      userInfo: usr,
      fStatus: formStatus.formFilled,
      vInfo: existingRecord,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Not working!!" });
  }
};

exports.formFill = async (req, res) => {
  const u = req.body;

  console.log(u);

  try {
    const { aadhar } = u;
    const existingUser = await Aadhar.findOne({ aadhar });

    if (existingUser) {
      console.log("User Exists");
      return res.status(400).json({ message: "User already exists" });
    }

    const aa = await Aadhar.create({
      _id: req.userId,
      parent: req.userId,
      aadhar: u.aadhar,
    });

    if (u.memberInfo) {
      const aaM = u.memberInfo.map(async (e) => {
        e._id = new mongoose.Types.ObjectId();
        e.name = `${e.fname} ${e.lname}`;
        delete e.fname;
        delete e.lname;
        return await Aadhar.create({
          _id: e._id,
          parent: req.userId,
          aadhar: e.aadhar,
        });
      });
    }

    // console.log(u.memberInfo);

    const form = await UserInfo.create({
      _id: req.userId,
      name: `${u.fname} ${u.lname}`,
      email: req.userEmail,
      gender: u.gender,
      dob: u.dob,
      phone: u.phone,
      aadhar: u.aadhar,
      address: {
        house: u.house,
        street: u.street,
        town: u.town,
        district: u.district,
        state: u.state,
        pincode: u.pincode,
      },
      members: u.memberInfo,
      photoFile: u.photoFile,
    });

    const updateFormStatus = await User.updateOne(
      { _id: req.userId },
      { formFilled: true }
    );

    res.status(200).json({ message: "Working!!", createdForm: form });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong!!", error });
  }
};

exports.locInfo = async (req, res) => {
  const { pincode, sdate } = req.body;
  // console.log(typeof parseInt(pincode));
  // console.log(sdate);

  var curDate = new Date(sdate);
  const c_date = (curDate.getDate()) + "-" + (curDate.getMonth() + 1) + "-" + curDate.getFullYear();
  console.log("Date=> ", curDate.getDate());
  console.log("Month=> ", curDate.getMonth() + 1);
  console.log("Year=> ", curDate.getFullYear());
  console.log();
  console.log(c_date);

  var pin_patt = /(^\d{6}$)/;

  try {
    if (!pin_patt.test(pincode)) {
      return res.status(500).json({ message: "Validation Error" });
    }

    const { data } = await api.get("/findByPin", {
      params: {
        pincode: parseInt(pincode),
        date: c_date,
      },
    });

    const p_to_get = [
      "name",
      "address",
      "state_name",
      "district_name",
      "block_name",
      "pincode",
      "from",
      "to",
      "fee_type",
      "min_age_limit",
      "vaccine",
    ];
    const final_data = data.sessions;

    final_data.forEach((arr_e, i, final_data) => {
      final_data[i] = Object.fromEntries(
        Object.entries(arr_e).filter(([key]) => p_to_get.includes(key))
      );
    });

    // console.log(data.sessions);
    // console.log(final_data);

    res.status(200).json({
      message: "Location Route Working",
      date: sdate,
      sites: final_data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Location Route Error", sdate, pincode });
  }
};
