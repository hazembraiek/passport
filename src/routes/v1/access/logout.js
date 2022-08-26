const express = require("express");
const accessController = require("../../../controllers/access.controller");
const route = express.Router();

route.route("/").post(accessController.logout);

module.exports = route;
