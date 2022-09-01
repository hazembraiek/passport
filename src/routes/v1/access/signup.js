const express = require("express");
const accessController = require("../../../controllers/access.controller");
const {
  codeVerificationSchema,
  ResendCodeVerificationSchema,
} = require("../schema/codeVerificationSchema");
const { signup } = require("../schema/userSchema");
const { validator } = require("./../../../middlewares/validator");
const route = express.Router();

route.route("/").post(validator(signup), accessController.signup);
route
  .route("/CodeVerify")
  .post(validator(codeVerificationSchema), accessController.CodeVerification);
route
  .route("/resendCode")
  .post(validator(ResendCodeVerificationSchema), accessController.resendCode);

module.exports = route;
