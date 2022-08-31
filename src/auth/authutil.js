const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs")
const { ApiError } = require("../core/apiError");


exports.createAccessToken = ({payload,expiresIn,secret}) => {
    let access_token;
    if(expiresIn)
        access_token = jwt.sign(payload,secret,{expiresIn});
    else
        access_token = jwt.sign(payload,secret);
    if(!access_token)
        throw new ApiError.InternalError("cannot generate token");
    return access_token;
}

exports.verifyToken = (token,secret) => {
    try{
      return jwt.verify(token,process.env.JWT_SECRET);
    }catch(err){
      if (err && err.name === 'TokenExpiredError') throw new Error("token has been expired");
      console.log(err)
      throw new Error("bad token");
    }
}

exports.createPasswordResetToken = (expiresIn) => {
    const randomBytes = crypto.randomBytes(32).toString("hex");
    return randomBytes;
}

exports.comparePassword = (encrypted,password) => {
    return bcrypt.compareSync(password, encrypted)
}

