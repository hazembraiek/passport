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
import {
  BadRequestError,
  ValidationError,
  NotFoundError,
} from "../core/apiError";
import { ObjectId } from "mongoose";
import User from "../db/models/userModel";
import KeyStore from "../db/models/KeyStore";
import { ProtectedRequest } from "../types/app-request";
// import { ResponseMIMEType } from "aws-sdk/clients/sagemaker";

const resetLink = (token: string): string =>
  `${process.env.RESET_LINK}?token=${token}`;
const ACCESS_TOKEN_EXPIRES = Number(process.env.ACCESS_TOKEN_EXPIRES) || 3600;
const RESET_LINK_EXPIRES = Number(process.env.RESET_LINK_EXPIRES) || 3600;

const fetchOneOr404 = async (model, query, message = "model not found") => {
  /*get one or 404*/
  const exist = await model.findOne(query);
  if (!exist) throw new NotFoundError(message);
  return exist;
};

const createAccessTokens = async (payload: any) => {
  const access_token = createAccessToken({
    expiresIn: ACCESS_TOKEN_EXPIRES,
    secret: process.env.JWT_SECRET,
    payload,
  });
  const refresh_token = createAccessToken({
    //never expires
    secret: process.env.REFRESH_TOKEN_SECRET,
    payload,
  });
  await keyStoreRepository.create({
    client: payload._id,
    key: refresh_token,
  } as KeyStore);
  return { access_token, refresh_token };
};

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await fetchOneOr404(
    userRepository,
    { email },
    "account does not exist"
  );

  if (!comparePassword(user._doc.password, password))
    throw new ValidationError("invalid password or email");

  const { access_token, refresh_token } = await createAccessTokens(user._doc);
  res.json({
    access_token,
    refresh_token,
    expiresIn: ACCESS_TOKEN_EXPIRES,
  });
});

export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { token: refreshToken } = req.body;
  verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  const tokenExist = await fetchOneOr404(
    keyStoreRepository,
    { key: refreshToken },
    "token not found"
  );
  const access_token = createAccessToken({
    expiresIn: ACCESS_TOKEN_EXPIRES,
    secret: process.env.JWT_SECRET,
    payload: tokenExist._doc.client._doc,
  });
  res.json({
    access_token,
  });
});

export const forgotPassword = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const existingUser = await fetchOneOr404(
      userRepository,
      { email },
      "Account does not exist"
    );
    const passwordResetToken = createPasswordResetToken(); //must be unique [TODO]
    await keyStoreRepository.create({
      client: existingUser._id,
      key: passwordResetToken,
      expires: new Date(Date.now() + RESET_LINK_EXPIRES),
    } as KeyStore);
    await sendMail({
      to: email,
      subject: "password reset",
      html: `<pre>your password reset link: ${resetLink(
        passwordResetToken
      )}</pre>
            <span>Rayen</span>
      `,
      text: resetLink(passwordResetToken),
    });
    res.json({
      message: "password reset link were sent check your mail",
    });
  }
);

export const resetPassoword = catchAsync(
  async (req: Request, res: Response) => {
    const { token } = req.query;
    const { password } = req.body;
    const tokenExists = await fetchOneOr404(
      keyStoreRepository,
      { key: token },
      "token invalid or expired"
    );

    const user = await fetchOneOr404(userRepository, {
      _id: tokenExists.client,
    });
    user.password = password;
    await user.save({ validateBeforeSave: false });
    await tokenExists.delete();
    res.json({ data: "your password has ben updated" });
  }
);

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
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {
    const userID = req.user._id;
    await keyStoreRepository.deleteRefrechByUserId(userID);
    res.status(200).json({ status: "success", message: "logout success" });
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
