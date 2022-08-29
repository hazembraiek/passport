const UserModel = require("../db/models/userModel");
const apiError = require("../core/apiError")
const catchAsync = require("../utils/catchAsync");

const getUser = async (email,password) => {
  /*user must say who they are*/
  const existingUser = await UserModel.findOne({email});
  if(!existingUser || !existingUser.comparePassword(password)){
      throw new apiError.ValidationError("invalid email or password");
  }
  return existingUser;
}


exports.login = catchAsync(async (req, res, next) => {
    /*all the data coming to controller must be verified by
      middlewares*/
    const { email, password } = req.body;
    const user = await getUser(email,password);
    const access_token = user.generateJWT(3600);
    res.status(200).json({
      access_token,   
      expiresIn:3600,
    });
});


exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await UserModel.create(req.body)
    console.log(newUser)
    res.json({data:newUser});
});

exports.logout = async (req, res, next) => {
  res.status(200).json({ register: true });
};
