import express from "express";
import { logout } from "../../../controllers/access.controller";
import authentication from "../../../auth/authentication";

const route = express.Router();

route.route("/").delete(authentication, logout);

export default route;
