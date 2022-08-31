const { hashString } = require("../../auth/authutil");
const UserVerificationModel = require("./../models/userVerificationModel");
require("dotenv").config();

exports.createVerification = async (userId, codeVerification) => {
  const expiresAt = Date.now() + +process.env.CODE_EXPIRES_IN;
  hashedCodeVerification = await hashString(10, codeVerification);
  return await UserVerificationModel.create({
    userId,
    codeVerification: hashedCodeVerification,
    expiresAt,
  });
};

exports.getVerification = async (userId) => {
  return await UserVerificationModel.find({ userId });
};
