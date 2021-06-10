const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Aadhar = require("../models/aadhar");
const Admin = require("../models/admin");
const Hospital = require("../models/hospital");
const UserInfo = require("../models/userInfo");
const Vaccine = require("../models/vaccine");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  try {
    const existingUser = await Admin.findOne({ email });

    if (!existingUser)
      return res.status(404).json({ message: "User doesn't exist." });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid Credentials" });

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    const h_record = await Hospital.findOne({ h_id: existingUser._id });

    res.status(200).json({ user: existingUser, hosp: h_record, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!!" });
  }
};

exports.signup = async (req, res) => {
  console.log(req.body);
  const { name, landmark, cs, pincode, email, password, confirmPassword } =
    req.body;

  try {
    const existingUser = await Admin.findOne({ email });

    if (existingUser)
      return res.status(400).json({ message: "User already exists." });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords don't match" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const a_id = new mongoose.Types.ObjectId();

    const result = await Admin.create({
      _id: a_id,
      email: email,
      password: hashedPassword,
    });

    const h_record = await Hospital.create({
      _id: new mongoose.Types.ObjectId(),
      h_id: a_id,
      name: name,
      landmark: landmark,
      cs: cs,
      pincode: pincode,
    });

    const token = jwt.sign(
      { email: result.email, id: result._id },
      process.env.JWT_KEY,
      { expiresIn: 120 }
    );

    console.log(res);

    res.status(200).json({ user: result, hosp: h_record, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!!" });
  }
};

exports.updateVaccineProfile = async (req, res) => {
  // console.log(req.body);
  const { type, pid, paadhar, vname, vdesc } = req.body;
  var existingUser, p_id;

  try {
    if (type) {
      p_id = new mongoose.Types.ObjectId(pid);

      existingUser = await UserInfo.findOne({ _id: p_id });

      if (!existingUser) {
        console.log("Usr-id record error");
        return res.status(500).json({
          message: "User doesn't exist / Registration form not filled",
        });
      }
    } else {
      var aa_pattern = /^[2-9]{1}[0-9]{3}\s{1}[0-9]{4}\s{1}[0-9]{4}$/;
      if (aa_pattern.test(paadhar)) {
        try {
          const usr_a = await Aadhar.findOne({ aadhar: paadhar });

          p_id = usr_a.parent;

          existingUser = await UserInfo.findOne({ _id: p_id });
        } catch {
          console.log("Usr-aadhar record error");
          return res.status(500).json({
            message: "User doesn't exist / Registration form not filled",
          });
        }
      } else {
        console.log("Aadhar validation error");
        return res.status(500).json({ message: "Validation Error" });
      }
    }

    //console.log(existingUser);
    //console.log(p_id);

    const h_id = new mongoose.Types.ObjectId(req.userId);
    const d = new Date();

    const exHospRecord = await Hospital.findOne({ h_id });

    const upRecords = exHospRecord.records;

    const newHrecord = {
      _id: new mongoose.Types.ObjectId(),
      p_id: p_id,
      p_name: existingUser.name,
      p_email: existingUser.email,
      p_phone: existingUser.phone,
      createdAt: d,
    };
    upRecords.push(newHrecord);

    const updateHRecord = await Hospital.updateOne(
      { h_id },
      { records: upRecords }
    );

    const existingRecord = await Vaccine.findOne({ p_id });
    // console.log(existingRecord)

    const vInfo = {
      v_name: vname,
      v_desc: vdesc,
      h_id: h_id,
      h_name: exHospRecord.name,
      location: exHospRecord.landmark +", " + exHospRecord.cs + "-" + exHospRecord.pincode,
      createdAt: d,
    };
    // console.log(pid);
    // console.log(vname);
    // console.log(vdesc);
    // console.log(vInfo);

    if (!existingRecord) {
      const vRecord = await Vaccine.create({
        _id: new mongoose.Types.ObjectId(),
        p_id: p_id,
        vaccinelist: vInfo,
      });
    } else {
      const nvlist = existingRecord.vaccinelist;
      nvlist.push(vInfo);

      const updateRecord = await Vaccine.updateOne(
        { p_id: p_id },
        { vaccinelist: nvlist }
      );
    }

    const record = await Vaccine.findOne({ p_id });

    res.status(200).json({ message: "Vaccination recorded", updated: record });
    // res.status(200).json({ message: "Working"});
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Vaccination update failed!!!" });
  }
};
