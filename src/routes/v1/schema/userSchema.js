const Joi = require("joi");

exports.signup = Joi.object({
  name: Joi.string().trim().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).alphanum().required(),
});
