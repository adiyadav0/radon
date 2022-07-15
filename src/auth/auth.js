const jwt = require('jsonwebtoken');
const userController = require('../controllers/userController')


const tokenverification = function(req,res,next)
{
    try{
    let token = req.headers["x-api-key"];
    if(!token)return res.status(401).send({status:false, message:"Please enter token in header"});
    let decodedToken;
    try{
         decodedToken = jwt.verify(token,"Project3");
    }
    catch(err){
        if(!decodedToken)return  res.status(401).send({status:false, message:"Token is invalid"});

    }
    req.userId = decodedToken.userId;
        next();
    }catch(error){
        res.status(500).send({status:false, message:error.message});
    }    
}

module.exports = {
    tokenverification
}