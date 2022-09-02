import Joi from "joi";
import { JoiObjectId } from "../../../middlewares/validator";

export const codeVerificationSchema = Joi.object({
  userId: JoiObjectId().required(),
  code: Joi.string().required().trim(),
});

export const ResendCodeVerificationSchema = Joi.object({
  userId: JoiObjectId().required(),
  email: Joi.string().email().required(),
});
