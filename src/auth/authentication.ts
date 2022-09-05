import userRepository from "./../db/repository/userRepo";
import catchAsync from "../utils/catchAsync";
import {
  AuthFailureError,
  TokenExpiredError,
  BadRequestError,
  AccessTokenError,
} from "../core/apiError";
import { verifyToken, getAccessToken } from "./authutil";
import { Response, NextFunction } from "express";
import { ProtectedRequest } from "../types/app-request";

export default catchAsync(
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {
    const accessToken = getAccessToken(req.headers.authorization);
    try {
      const decodedToken = await verifyToken(
        accessToken,
        process.env.JWT_SECRET
      );
      console.log(decodedToken);
      const user = await userRepository.findById(decodedToken?._id);
      if (!user) throw new AuthFailureError("User not registered");
      req.user = user;
      return next();
    } catch (e) {
      if (e instanceof TokenExpiredError) throw new AccessTokenError(e.message);
      throw new BadRequestError(e.message);
    }
  }
);
