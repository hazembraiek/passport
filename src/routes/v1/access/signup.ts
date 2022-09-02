import express from "express";
import {
  CodeVerification,
  resendCode,
  signup,
} from "../../../controllers/access.controller";
import {
  codeVerificationSchema,
  ResendCodeVerificationSchema,
} from "../schema/codeVerificationSchema";
import { signupValidator } from "../schema/userSchema";
import { validator } from "./../../../middlewares/validator";

const route = express.Router();

route.route("/").post(validator(signupValidator), signup);
route
  .route("/CodeVerify")
  .post(validator(codeVerificationSchema), CodeVerification);
route
  .route("/resendCode")
  .post(validator(ResendCodeVerificationSchema), resendCode);

export default route;
