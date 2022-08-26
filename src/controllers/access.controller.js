const UserModel = require("../db/models/userModel");
const catchAsync = require("../utils/catchAsync");

const Login = (model) => {
  return catchAsync(async (req, res, next) => {
    // const { email, password } = req.body;
    const users = await model.find();
    res.status(200).json({ users });
  });
};

exports.login = Login(UserModel);

exports.signup = async (req, res, next) => {
  res.status(200).json({ register: true });
};

exports.logout = async (req, res, next) => {
  res.status(200).json({ register: true });
};
