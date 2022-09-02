import express from "express";
import { login,refreshToken,forgotPassword,resetPassoword } from "../../../controllers/access.controller"
const route = express.Router();

route.route("/").post(login);
route.route("/token").post(refreshToken);
route.route("/forgot_password").post(forgotPassword);
route.route("/password_reset").post(resetPassoword);

export default route;
