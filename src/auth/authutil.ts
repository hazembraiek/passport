import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { BadRequestError } from "../core/apiError";
import { verify } from "jsonwebtoken";
import {
  AuthFailureError,
  TokenExpiredError,
  BadTokenError,
} from "../core/apiError";
import { promisify } from "util";
import User from "../db/models/userModel";

export const getAccessToken = (authorization: string) => {
  if (!authorization) throw new AuthFailureError();
  if (!authorization.startsWith("Bearer ")) throw new AuthFailureError();
  return authorization.split(" ")[1];
};

export const createAccessToken = (params: any) => {
  let access_token;
  if (params.expiresIn)
    access_token = jwt.sign(params.payload, params.secret, {
      expiresIn: params.expiresIn,
    });
  else access_token = jwt.sign(params.payload, params.secret);
  if (!access_token) throw new BadRequestError("cannot generate token");
  return access_token;
};

export const verifyToken = async (
  token: string,
  secret: jwt.Secret
): Promise<User> => {
  try {
    return verify(token, secret) as User;
  } catch (e) {
    if (e && e.name === "TokenExpiredError") throw new TokenExpiredError();
    throw new BadTokenError(e.message);
  }
};

export const createPasswordResetToken = () => {
  const randomBytes = crypto.randomBytes(32).toString("hex");
  return randomBytes;
};

export const comparePassword = (encrypted: string, password: string) => {
  return bcrypt.compareSync(password, encrypted);
};

export const compareStringAndHash = (string: string, hashS: string) => {
  return bcrypt.compareSync(string, hashS);
};

export const hashString = (string: string) => {
  return bcrypt.hash(string, 10);
};
