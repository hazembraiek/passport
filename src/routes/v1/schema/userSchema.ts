import Joi from "joi";

export const signupValidator = Joi.object({
  name: Joi.string().trim().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).alphanum().required(),
});
