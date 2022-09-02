import UserModel from "../db/models/index";
import KeyStoreModel from "../db/models/index";
import catchAsync from "../utils/catchAsync";
import sendMail from "../utils/mailSender";
import userRepository from "./../db/repository/userRepo";
import keyStoreRepository from "../db/repository/KeyStoreRepo";
import {
  createAccessToken,
  verifyToken,
  comparePassword,
  createPasswordResetToken,
  hashString,
  compareStringAndHash,
} from "../auth/authutil";
import { generateCodeVerification } from "../utils/generateCode";
import { sendEmail } from "../utils/sendEmail";
import { NextFunction, Request, Response } from "express";
import { BadRequestError, ValidationError } from "../core/apiError";
import User from "../db/models/userModel";
import { ObjectId } from "mongoose";

// const resetLink = (token: string): string =>
//   `${process.env.RESET_LINK}?token=${token}`;
// const ACCESS_TOKEN_EXPIRES = Number(process.env.ACCESS_TOKEN_EXPIRES) || 3600;
// const RESET_LINK_EXPIRES = Number(process.env.RESET_LINK_EXPIRES) || 3600;

// const fetchOneOr404 = async (
//   model,
//   query,
//   message: string = "model not found"
// ) => {
//   /*get one or 404*/
//   const exist = await model.findOne(query);
//   if (!exist) throw new ValidationError(message);
//   return exist;
// };

// const createAccessTokens = async (payload: User) => {
//   const access_token = createAccessToken({
//     expiresIn: ACCESS_TOKEN_EXPIRES,
//     secret: process.env.JWT_SECRET,
//     payload,
//   });
//   const refresh_token = createAccessToken({
//     //never expires
//     secret: process.env.REFRESH_TOKEN_SECRET,
//     payload,
//   });

//   await KeyStoreModel.create({
//     client: payload._id,
//     key: refresh_token,
//   });

//   return { access_token, refresh_token };
// };

// export const login = catchAsync(async (req: Request, res: Response) => {
//   const { email, password } = req.body;
//   const user = await fetchOneOr404(
//     UserModel,
//     { email },
//     "account does not exist"
//   );
//   if (!compareStringAndHash(password, user._doc.password))
//     throw new ValidationError("invalid password or email");
//   const { access_token, refresh_token } = await createAccessTokens(user._doc);
//   res.json({
//     access_token,
//     refresh_token,
//     expiresIn: ACCESS_TOKEN_EXPIRES,
//   });
// });

// export const refreshToken = catchAsync(async (req, res) => {
//   const { token: refreshToken } = req.body;
//   verifyToken(refreshToken);
//   const tokenExist = await fetchOneOr404(KeyStoreModel, { key: refreshToken });
//   const access_token = createAccessToken({
//     expiresIn: ACCESS_TOKEN_EXPIRES,
//     secret: process.env.JWT_SECRET,
//     payload: tokenExist._doc.client._doc,
//   });
//   res.json({
//     access_token,
//   });
// });

// export const forgotPassword = catchAsync(async (req, res) => {
//   const { email } = req.body;
//   const existingUser = await fetchOneOr404(UserModel, { email });
//   const passwordResetToken = createPasswordResetToken(); //must be unique [TODO]
//   await KeyStoreModel.create({
//     client: existingUser._id,
//     key: passwordResetToken,
//     expires: Date.now() + RESET_LINK_EXPIRES,
//   });

//   await sendMail({
//     to: email,
//     subject: "password reset",
//     html: `<pre>your password reset link: ${resetLink(passwordResetToken)}</pre>
//             <span>Rayen</span>
//       `,
//   });
//   res.json({
//     data: "password reset link were sent check your mail",
//   });
// });

// export const resetPassoword = catchAsync(async (req, res) => {
//   const { token } = req.query;
//   const { password } = req.body;
//   const tokenExists = await fetchOneOr404(
//     KeyStoreModel,
//     { key: token },
//     "token invalid or expired"
//   );
//   const user = await fetchOneOr404(UserModel, { _id: tokenExists.client });
//   user.password = password;
//   await user.save();
//   await tokenExists.delete();
//   res.json({ data: "your password has ben updated" });
// });

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    const user = await userRepository.getUserByEmail(email);
    if (user) throw new BadRequestError("user already registered");

    const passwordHash = await hashString(password);
    const createdUser = await userRepository.createUser({
      name,
      email,
      password: passwordHash,
    } as User);

    const data = { _id: createdUser._id, email: createdUser.email };

    sendCodeVerification(data._id, email);

    res.status(200).json({ status: "success", data });
  }
);

export const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ register: true });
  }
);

export const CodeVerification = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, code } = req.body;

    const user = await userRepository.findById(userId);
    if (user) throw new BadRequestError("user already verified ");

    const userVerificationRecords = await keyStoreRepository.getVerification(
      userId
    );

    if (userVerificationRecords.length == 0)
      throw new BadRequestError(
        "account record doesn't exist or user not found "
      );

    const CodeVerified = userVerificationRecords.find((verOpt) =>
      compareStringAndHash(code, verOpt.key)
    );

    if (CodeVerified && CodeVerified.expires > new Date(Date.now())) {
      await userRepository.activeUser(userId);
      await keyStoreRepository.deleteExpiresCodes(userId);
    } else if (CodeVerified && CodeVerified.expires < new Date(Date.now())) {
      throw new BadRequestError("code has expired , please request again");
    } else {
      throw new BadRequestError("invalid code verification");
    }

    res
      .status(200)
      .json({ status: "success", message: "user email verified successfully" });
  }
);

export const resendCode = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, email } = req.body;

    const user = await userRepository.getUserByEmail(email);
    if (user) throw new BadRequestError("user already verified");

    sendCodeVerification(userId, email);

    res
      .status(200)
      .json({ status: "success", message: "code resended successfully" });
  }
);

const sendCodeVerification = async (userId: ObjectId, email: string) => {
  const code = generateCodeVerification();
  await keyStoreRepository.createVerification(userId, code);
  sendEmail(email, "signup", code);
};
