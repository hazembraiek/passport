const express = require("express");
const router = require("..");
const accessController = require("../../../controllers/access.controller");
const route = express.Router();

route.route("/").post(accessController.login);
route.route("/token").post(accessController.refreshToken);
route.route("/forgot_password").post(accessController.forgotPassword);
route.route("/password_reset").post(accessController.resetPassoword)

module.exports = route;
