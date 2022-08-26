const express = require("express");
const login = require("./access/login");
const signup = require("./access/login");
const logout = require("./access/logout");
const router = express.Router();

const defaultRoutes = [
  {
    path: "/login",
    route: login,
  },
  {
    path: "/signup",
    route: signup,
  },
  {
    path: "/logout",
    route: logout,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
