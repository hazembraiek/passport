const apiError = require("../core/apiError");
const catchAsync = require("../utils/catchAsync");
const sendMail = require("../utils/mailSender");
const { UserVerificationRepository, UserRepository,KeyStoreRepo } = require("../db/repository");
const authUtil = require("../auth/authutil");
const { generateCodeVerification } = require("../utils/generateCode");


const resetLink = (token) => `${process.env.RESET_LINK}?token=${token}`;
const ACCESS_TOKEN_EXPIRES = Number(process.env.ACCESS_TOKEN_EXPIRES) || 3600;
const RESET_LINK_EXPIRES = Number(process.env.RESET_LINK_EXPIRES) || 3600;



const fetchOneOr404 = async (model, query, message = "model not found") => {
  /*get one or 404*/
  const exist = await model.findOne(query);
  if(!exist)
      throw new apiError.NotFoundError(message)
  return exist
}

const createAccessTokens = async (payload) => {
    const access_token = authUtil.createAccessToken({
        expiresIn:ACCESS_TOKEN_EXPIRES,
        secret:process.env.JWT_SECRET,
        payload
    });
    const refresh_token = authUtil.createAccessToken({  //never expires
        secret:process.env.REFRESH_TOKEN_SECRET,
        payload
    });
    await KeyStoreRepo.create({
      client:payload._id,
      key:refresh_token,
    });
    return {access_token,refresh_token}
}

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await fetchOneOr404(
    UserRepository,
    { email },
    "account does not exist"
  );
 
  if (!authUtil.comparePassword(user._doc.password, password))
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
  authUtil.verifyToken(refreshToken,process.env.REFRESH_TOKEN_SECRET);
  const tokenExist = await fetchOneOr404(KeyStoreRepo,{key:refreshToken},"token not found");
  const access_token = authUtil.createAccessToken({
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
  const existingUser = await fetchOneOr404(UserRepository,{email},"Account does not exist");
  const passwordResetToken = authUtil.createPasswordResetToken(); //must be unique [TODO]
  await KeyStoreRepo.create({
    client:existingUser._id,
    key:passwordResetToken,
    expires:Date.now() + RESET_LINK_EXPIRES 
  })
  await sendMail({
    to: email,
    subject: "password reset",
    html: `<pre>your password reset link: ${resetLink(passwordResetToken)}</pre>
            <span>Rayen</span>
      `,
    text:resetLink(passwordResetToken)
  });
  res.json({
    message:"password reset link were sent check your mail",
  })
});

exports.resetPassoword = catchAsync(async (req, res) => {
  const { token } = req.query;
  const { password } = req.body;
  const tokenExists = await fetchOneOr404(KeyStoreRepo,{key:token},"token invalid or expired");
 
  const user = await fetchOneOr404(UserRepository,{_id:tokenExists.client});
  user.password = password;
  await user.save({validateBeforeSave:false});
  await tokenExists.delete();
  res.json({ data: "your password has ben updated" });
});


exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await UserRepository.getUserByEmail(email);
  if (user) throw new apiError.BadRequestError("user already registered");

  const passwordHash = await authUtil.hashString(10, password);

  const createdUser = await UserRepository.createUser({
    name,
    email,
    password: passwordHash,
  });

  const data = { _id: createdUser._id, email: createdUser.email };
  const code = generateCodeVerification();
  await UserVerificationRepository.createVerification(data._id, code);

  await sendMail({
    to: email,
    subject: "code verification",
    html: `<p>you code is : ${code} , this code expires in 1 hour </p>
            <h2>Brayek hazem</h2>
      `,
  });
  res.status(200).json({ status: "success", data });
});

exports.logout = async (req, res, next) => {
  res.status(200).json({ register: true });
};


exports.CodeVerification = catchAsync(async (req, res, next) => {
  const { userId, code } = req.body;
  const userVerificationRecords =
    await UserVerificationRepository.getVerification(userId);

  if (userVerificationRecords.length < 0)
    throw new apiError.BadRequestError("");

  const CodeVerified = userVerificationRecords.find((verOpt) =>
    authUtil.compareStringAndHash(code, verOpt.codeVerification)
  );

  if (CodeVerified) {
    await UserRepository.activeUser(userId);
  } else {
    throw new apiError.BadRequestError("invalid code verification");
    // await UserVerificationRepository.deleteVerification(userId);
  }

  res
    .status(200)
    .json({ status: "success", message: "user email verified successfully" });
});


/*
  Login:
    -getUser
    -retutn access token refresh token
  refresh token
    -verify refresh token
    -return new access token
  forgot password
    -getUser
    -send reset link
  reset password:
    -verify reset token
    -set new password
  class LocalAuth{
      getUser();
      refreshAccessToken();
      sendResetLinkWithEmail();
      sendResetLinkWithPhone();
      verifyToken();
      updateNewPassword;
  }
*/


