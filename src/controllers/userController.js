const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const validation = require('../validator/validation')


const registration = async function (req, res) {
  try {
    let data = req.body;
    const { title, name, phone, email, password, address} = data;

    if (!validation.isBodyEmpty(data)) return res.status(400).send({ status: false, message: "Please provide required data" });

    if (!validation.isValid(title)) return res.status(400).send({ status: false, message: "title tag is required" });
    if (!validation.isValid(name)) return res.status(400).send({ status: false, message: "name tag is required" });
    data.name = data.name.trim().split(" ").filter(word=>word).join(" ")


    if (!validation.isValid(phone)) return res.status(400).send({ status: false, message: "phone tag is required" });
    if (!validation.isValid(email)) return res.status(400).send({ status: false, message: "email tag is required" });
    if (!validation.isValid(password)) return res.status(400).send({ status: false, message: "password tag is required" });

    if (validation.isVerifyString(title)) return res.status(400).send({ status: false, message: "title doesn't contains any digit or symbols" });
    let arr = ["Mr", "Mrs", "Miss"]
    if (!arr.includes(title)) return res.status(400).send({ status: false, message: "Provide valid value for title [Mr,Mrs,Miss]" });
    if (validation.isVerifyString(name)) return res.status(400).send({ status: false, message: "name doesn't contains any digit or symbols" });
    if (!validation.validateEmail(email)) return res.status(400).send({ status: false, message: "Email is Invalid" });
    
    let isPresentEmail = await userModel.find({ email: email })
    if (isPresentEmail.length != 0) return res.status(400).send({ status: false, message: "This email already exists" });
    ///
    if (!validation.isValidMobileNo(phone)) return res.status(400).send({ status: false, message: "Mobile number is Invalid" });
    if (password.length < 8) return res.status(400).send({ status: false, message: "password is too short" });
    if (password.length >= 16) return res.status(400).send({ status: false, message: "password is too Long" });
    if (address) {
      // if street only has whitespace characters
    if (!data.address.street?.trim() && data.address.street) {
        return res.status(400).send({ status: false, message: "street is invalid" });}
      // if city only has whitespace characters
    if (!data.address.city?.trim() && data.address.city) {
        return res.status(400).send({ status: false, message: "city is invalid" });}
    if(validation.isVerifyString(data.address.city)) return  res.status(400).send({ status: false, message: "City doesn't contains any digit or symbol" });
    if(validation.isValid(data.address.pincode)){
      if(!validation.isValidPincode(data.address.pincode)) return res.status(400).send({ status: false, message: "please provide a valid pincode" });
    }}
  

    let isPresentNumber = await userModel.find({ phone: phone })
    if (isPresentNumber.length != 0) return res.status(400).send({ status: false, message: "This Number already Exists" });


    //(409)  findOne

      

    let save = await userModel.create(data);
    res.status(201).send({ status: true, message: 'Success', data: save });

  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};




const login = async function (req, res) {
  try {
    let data = req.body;
    
    if(!validation.isBodyEmpty(data)) return res.status(400).send({ status: false, message: "Please provide required data" });
    let email = req.body.email;
    if(!validation.validateEmail(email)) return res.status(400).send({ status: false, message: "Email is required" });

    let password = req.body.password;
    if(!password) return res.status(400).send({status:false, message:"Password is required"})
    if (password.length < 8) return res.status(400).send({ status: false, message: "password is too short" });
    if (password.length >= 16) return res.status(400).send({ status: false, message: "password is too Long" });

    let user = await userModel.findOne({ email: email, password: password });
  
    if(!user) return res.status(400).send({ status: false, message: "Input credentials are Invalid" });

    let token = jwt.sign({
      userId: user._id.toString(),
      email:user.email.toString()

    }, "Project3",{expiresIn:"12h"});

    // iat: Math.floor(Date.now() / 1000),
    // exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60 



    res.setHeader("x-api-key", token);
    res.status(200).send({ status: true, message: 'Success', data: token });
  } catch (error) { res.status(500).send({ status: false, messgae: error.message }) }
}
module.exports = {
  registration, login
}
