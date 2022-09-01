const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { ApiError } = require("../core/apiError");
const { verify } = require("jsonwebtoken");
const {
  AuthFailureError,
  TokenExpiredError,
  BadTokenError,
} = require("../core/apiError");
const { promisify } = require("util");

exports.getAccessToken = (authorization) => {
  if (!authorization) throw new AuthFailureError();
  if (!authorization.startsWith("Bearer ")) throw new AuthFailureError();
  return authorization.split(" ")[1];
};

exports.createAccessToken = ({ payload, expiresIn, secret }) => {
  let access_token;
  if (expiresIn) access_token = jwt.sign(payload, secret, { expiresIn });
  else access_token = jwt.sign(payload, secret);
  if (!access_token) throw new ApiError.InternalError("cannot generate token");
  return access_token;
};

exports.verifyToken = async (token) => {
  const secret = process.env.JWT_SECRET;
  try {
    return await promisify(verify)(token, secret);
  } catch (e) {
    if (e && e.name === "TokenExpiredError") throw new TokenExpiredError();
    throw new BadTokenError(e.message);
  }
};

exports.createPasswordResetToken = (expiresIn) => {
  const randomBytes = crypto.randomBytes(32).toString("hex");
  return randomBytes;
};

exports.comparePassword = (encrypted, password) => {
  return bcrypt.compareSync(password, encrypted);
};

exports.compareStringAndHash = (string, hashS) => {
  return bcrypt.compareSync(string, hashS);
};

exports.hashString = (string) => {
  return bcrypt.hash(string, 10);
};
