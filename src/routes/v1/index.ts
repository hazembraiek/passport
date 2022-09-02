import express from "express";
import login from "./access/login";
import logout from "./access/logout";
import signup from "./access/signup";

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

export default router;
