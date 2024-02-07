const jwt = require("jsonwebtoken");
const blackListedTokensModel = require("../models/blackListedTokens");
const secretKey = process.env.ACCESS_TOKEN_SECRET;

async function checkBlackListToken (req, res, next) {
    try{
    const token = req.headers['authorization']?.split(' ')[1];
    if(!token){
        return res.status(403).end(); 
    }

    const blackListToken = await blackListedTokensModel.findOne({token: token})
    if (blackListToken) {
        return res.status(403).end(); 
    }

    jwt.verify(token, secretKey, (err, customer) => {
        if (err){ 
           return res.status(403).end();
        }
        req.customer = customer;
        next();
    });
}
catch(err){
    res.status(400).json(err.message);
}
}

module.exports = checkBlackListToken;