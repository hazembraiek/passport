const express = require("express");
const { authorization } = require("../../../auth/authorization");
const accessController = require("../../../controllers/access.controller");
const route = express.Router();

route.route("/").post(authorization, accessController.login);

module.exports = route;
