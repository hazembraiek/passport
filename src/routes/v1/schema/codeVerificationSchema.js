const Joi = require("joi");
const { JoiObjectId } = require("../../../middlewares/validator");

exports.codeVerificationSchema = Joi.object({
  userId: JoiObjectId().required(),
  code: Joi.string().required(),
});

exports.ResendCodeVerificationSchema = Joi.object({
  userId: JoiObjectId().required(),
  email: Joi.string().email().required(),
});
