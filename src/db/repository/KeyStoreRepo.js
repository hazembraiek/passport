const { hashString } = require("../../auth/authutil");
const KeyStoreModel = require("../models/KeyStore");
require("dotenv").config();

exports.createVerification = async (client, codeVerification) => {
  const expires = Date.now() + +process.env.CODE_EXPIRES_IN;
  hashedCodeVerification = await hashString(codeVerification);
  return await KeyStoreModel.create({
    client,
    key: hashedCodeVerification,
    expires,
  });
};

exports.getVerification = async (userId) => {
  return await KeyStoreModel.find({
    client: userId,
  });
};

exports.deleteExpiresCodes = async (userId) => {
  return await KeyStoreModel.deleteMany({
    client: userId,
  });
};
