const { UserModel, KeyStoreModel } = require("../db/models");
const apiError = require("../core/apiError");
const catchAsync = require("../utils/catchAsync");
const sendMail = require("../utils/mailSender");
const userRepository = require("./../db/repository/userRepo");
const keyStoreRepository = require("../db/repository/KeyStoreRepo");
const {
  createAccessToken,
  verifyToken,
  comparePassword,
  createPasswordResetToken,
  hashString,
  compareStringAndHash,
} = require("../auth/authutil");
const { generateCodeVerification } = require("../utils/generateCode");
const { sendEmail } = require("../utils/sendEmail");
const { signup } = require("../routes/v1/schema/userSchema");

const resetLink = (token) => `${process.env.RESET_LINK}?token=${token}`;
const ACCESS_TOKEN_EXPIRES = Number(process.env.ACCESS_TOKEN_EXPIRES) || 3600;
const RESET_LINK_EXPIRES = Number(process.env.RESET_LINK_EXPIRES) || 3600;

const fetchOneOr404 = async (model, query, message = "model not found") => {
  /*get one or 404*/
  const exist = await UserModel.findOne(query);
  if (!exist) throw new apiError.ValidationError(message);
  return exist;
};

const createAccessTokens = async (payload) => {
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

  await KeyStoreModel.create({
    client: payload._id,
    key: refresh_token,
  });

  return { access_token, refresh_token };
};

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await fetchOneOr404(
    UserModel,
    { email },
    "account does not exist"
  );
  if (!compareStringAndHash(password, user._doc.password))
    throw new apiError.ValidationError("invalid password or email");
  const { access_token, refresh_token } = await createAccessTokens(user._doc);
  res.json({
    access_token,
    refresh_token,
    expiresIn: ACCESS_TOKEN_EXPIRES,
  });
});

exports.refreshToken = catchAsync(async (req, res) => {
  const { token: refreshToken } = req.body;
  verifyToken(refreshToken);
  const tokenExist = await fetchOneOr404(KeyStoreModel, { key: refreshToken });
  const access_token = createAccessToken({
    expiresIn: ACCESS_TOKEN_EXPIRES,
    secret: process.env.JWT_SECRET,
    payload: tokenExist._doc.client._doc,
  });
  res.json({
    access_token,
  });
});

exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const existingUser = await fetchOneOr404(UserModel, { email });
  const passwordResetToken = createPasswordResetToken(); //must be unique [TODO]
  await KeyStoreModel.create({
    client: existingUser._id,
    key: passwordResetToken,
    expires: Date.now() + RESET_LINK_EXPIRES,
  });

  sendEmail(email, "", resetLink(passwordResetToken));
  // await sendMail({
  //   to: email,
  //   subject: "password reset",
  //   html: `<pre>your password reset link: ${resetLink(passwordResetToken)}</pre>
  //           <span>Rayen</span>
  //     `,
  // });
  res.json({
    data: "password reset link were sent check your mail",
  });
});

exports.resetPassoword = catchAsync(async (req, res) => {
  const { token } = req.query;
  const { password } = req.body;
  const tokenExists = await fetchOneOr404(
    KeyStoreModel,
    { key: token },
    "token invalid or expired"
  );
  const user = await fetchOneOr404(UserModel, { _id: tokenExists.client });
  user.password = password;
  await user.save();
  await tokenExists.delete();
  res.json({ data: "your password has ben updated" });
});

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await userRepository.getUserByEmail(email);
  if (user) throw new apiError.BadRequestError("user already registered");

  const passwordHash = await hashString(password);
  const createdUser = await userRepository.createUser({
    name,
    email,
    password: passwordHash,
  });

  const data = { _id: createdUser._id, email: createdUser.email };

  sendCodeVerification(data._id, email);

  res.status(200).json({ status: "success", data });
});

exports.logout = async (req, res, next) => {
  res.status(200).json({ register: true });
};

exports.CodeVerification = catchAsync(async (req, res, next) => {
  const { userId, code } = req.body;

  const user = await userRepository.findById(userId);
  if (user) throw new apiError.BadRequestError("user already verified ");

  const userVerificationRecords = await keyStoreRepository.getVerification(
    userId
  );

  if (userVerificationRecords.length == 0)
    throw new apiError.BadRequestError(
      "account record doesn't exist or user not found "
    );

  const CodeVerified = userVerificationRecords.find((verOpt) =>
    compareStringAndHash(code, verOpt.key)
  );

  if (CodeVerified && CodeVerified.expires > Date.now()) {
    await userRepository.activeUser(userId);
    await keyStoreRepository.deleteExpiresCodes(userId);
  } else if (CodeVerified && CodeVerified.expires < Date.now()) {
    throw new apiError.BadRequestError(
      "code has expired , please request again"
    );
  } else {
    throw new apiError.BadRequestError("invalid code verification");
  }

  res
    .status(200)
    .json({ status: "success", message: "user email verified successfully" });
});

exports.resendCode = catchAsync(async (req, res, next) => {
  const { userId, email } = req.body;

  const user = await userRepository.getUserByEmail(email);
  if (user) throw new apiError.BadRequestError("user already verified");

  sendCodeVerification(userId, email);

  res
    .status(200)
    .json({ status: "success", message: "code resended successfully" });
});

const sendCodeVerification = async (userId, email) => {
  const code = generateCodeVerification();
  await keyStoreRepository.createVerification(userId, code);
  sendEmail(email, "signup", code);
};
