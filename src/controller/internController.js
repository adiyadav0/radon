const internModel = require("../models/internModel");
const collegeModel = require("../models/collegeModel");
const valid = require("../validation/validation")
const evalidator = require("validator");
const { ConnectionStates } = require("mongoose");

const intern = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin','*')
  try {
    let internData = req.body;
    let { name, email, mobile, collegeName } = req.body



    if (Object.keys(internData).length == 0) {
      return res
        .status(400)
        .send({ status: false, msg: "Body should  be not Empty.. " });
    }


    if(!valid.isValid(collegeName)) {
      return res
        .status(400)
        .send({ status: false, msg: "CollegeId field is mandatory" });
    }

    if (!valid.reg(collegeName))
      return res.status(400).send({ status: false, msg: "Please enter valid college name." })
      
      collegeName = collegeName.toLowerCase()
    

    let college = await collegeModel.findOne({ name: collegeName })

    if (!college) return res.status(404).send({ status: false, msg: "No such college found." })
    internData.collegeId = college["_id"]



   //<-------These validations for Mandatory fields--------->//
    if (!valid.isValid(name)) {
      return res
      .status(400)
      .send({ status: false, msg: "Name field is mandatory" });
    }
    if (!valid.isValid(email)) {
      return res
      .status(400)
      .send({ status: false, msg: "Email field is mandatory" });
    }
    if (!valid.isValid(mobile)) {
      return res
      .status(400)
      .send({ status: false, msg: "Mobile field is mandatory" });
    }
    
    
    if (!valid.reg(name))
    return res
    .status(400)
    .send({ status: false, msg: "Please Use Alphabets in name" });
    
    
    let reg = /^[6-9]\d{9}$/.test(mobile);
    
    if (!reg) {
      return res
      .status(400)
      .send({ status: false, msg: "invalid phone number" });
    }
    
    internData.mobile = mobile.toString()
    
    //<--------Checking Duplicate Email and Mobile--------->//

    let duplicateEmail = await internModel.findOne({ email: email });
    if (duplicateEmail) {
      return res
      .status(400)
      .send({ status: false, msg: "Email Already Exist." });
    }

    let duplicatePhone = await internModel.findOne({ mobile: mobile });
    if (duplicatePhone) {
      return res
        .status(400)
        .send({ status: false, msg: "Phone Number Already Exist." });
    }


   //<---------Checking Email Validation---------->//


    let validate = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
    if (!validate) {
      return res
        .status(400)
        .send({
          status: false,
          msg: "You have entered an invalid email address!",
        });
    }
    
    internData.name = name.replace(/\s+/g, " ");
     
    let result = await internModel.create(internData);
    res.status(201).send({ status: true, Data: result });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

module.exports = {
  intern: intern,
};
