const mongoose = require('mongoose')
// const objectId = 
const isBodyEmpty = function(data)
{
    if(Object.keys(data).length==0) return false 
    return true 
}

//return Object.keys(data).length==0

const isValid = function(value)
{
    if(typeof value === 'undefined' || typeof value === null ) return false
    if(typeof value ==='string' && value.trim().length === 0) return false // name: ""
    return true
}


// pincode validation
const isValidPincode = function (pincode) {
    const pattern = /^[1-9]{1}[0-9]{2}\s?[0-9]{3}$/;
    return pattern.test(pincode); // returns a boolean
  };

const isValidOjectId = function(id)
{
    if(mongoose.Types.ObjectId.isValid(id)) return true;
    return false;
}

// releasedAt validation
const isValidRelAt = function (releasedAt) {
    const pattern = /^\d{4}-\d{2}-\d{2}$/;
    return pattern.test(releasedAt); // returns a boolean
  };
// ISBN validation  -R->T e->F
const checkISBN  = function (ISBN) {
    const pattern = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/;
    return pattern.test(ISBN); // returns a boolean
  };

const validateEmail = function (mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
        return (true)
    }
};

const regex = /[`/\d/!@#$%^&*()_+\=\[\]{};':"\\|.<>\/?~]/
const isVerifyString = function (string) {
    return regex.test(string)
};

const regEx=/^[6-9]\d{9}$/
const isValidMobileNo = function(mobno)
{
    return regEx.test(mobno)
}



const regexForRating = /^[1-5]$/
const checkRating = function (rating) {
   return regexForRating.test(rating)  
}




// stri -- false ,nu --. true
// const regex1 = /\d/;
// const isVerifyISBN = function (value) {
// return regex1.test(value)
// };
// const checkISBN = function(isbn)  
// {
//     let number = isbn;
//     let enumber= number.replace('-',''); //1234567
//     let bool = isVerifyISBN(enumber)
//     if(bool && enumber.length==13) return true;
//     return false;

// }





module.exports={ isBodyEmpty, isValid,validateEmail,isValidMobileNo, isVerifyString, isValidOjectId,checkISBN,isValidPincode,isValidRelAt, checkRating}