const express = require("express");
const accessController = require("../../../controllers/access.controller");
const { signup } = require("../schema/userSchema");
const validator = require("./../../../middlewares/validator");
const route = express.Router();

route.route("/").post(validator(signup), accessController.signup);
route.route("/CodeVerify").post(accessController.CodeVerification);

module.exports = route;
