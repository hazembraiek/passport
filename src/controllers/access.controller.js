const { UserRepo, KeyStoreRepo } = require("../db/repository");
const apiError  = require("../core/apiError");
const catchAsync = require("../utils/catchAsync");
const sendMail  = require("../utils/mailSender");
const { createAccessToken, 
        verifyToken, 
        comparePassword,
        createPasswordResetToken 
      } = require("../auth/authutil");


const resetLink = (token) => `${process.env.RESET_LINK}?token=${token}`
const ACCESS_TOKEN_EXPIRES = Number(process.env.ACCESS_TOKEN_EXPIRES) || 3600;
const RESET_LINK_EXPIRES = Number(process.env.RESET_LINK_EXPIRES) || 3600;


const fetchOneOr404 = async (model,query,message="model not found") => {
  /*get one or 404*/
  const exist = await model.findOne(query);
  if(!exist)
      throw new apiError.NotFoundError(message)
  return exist
}



const createAccessTokens = async (payload) => {
    const access_token = createAccessToken({
        expiresIn:ACCESS_TOKEN_EXPIRES,
        secret:process.env.JWT_SECRET,
        payload
    });
    const refresh_token = createAccessToken({  //never expires
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
    const user = await fetchOneOr404(UserRepo,{email},"Account does not exist");
    if(!comparePassword(user._doc.password,password))
      throw new apiError.ValidationError("invalid password or email");
    const {access_token,refresh_token} = await createAccessTokens(user._doc);
    res.json({
      access_token,   
      refresh_token,
      expiresIn:ACCESS_TOKEN_EXPIRES,
    });
});


exports.refreshToken = catchAsync(async (req,res) => {
  const { token:refreshToken } = req.body;
  verifyToken(refreshToken);
  const tokenExist = await fetchOneOr404(KeyStoreRepo,{key:refreshToken},"token not found");
  const access_token = createAccessToken({
    expiresIn:ACCESS_TOKEN_EXPIRES,
    secret:process.env.JWT_SECRET,
    payload:tokenExist._doc.client._doc
  });
  res.json({
    access_token
  })
});

exports.forgotPassword = catchAsync(async (req,res) => {
  const { email } = req.body;
  const existingUser = await fetchOneOr404(UserRepo,{email},"Account does not exist");
  const passwordResetToken = createPasswordResetToken(); //must be unique [TODO]
  await KeyStoreRepo.create({
    client:existingUser._id,
    key:passwordResetToken,
    expires:Date.now() + RESET_LINK_EXPIRES 
  })
  await sendMail({
      to:email,
      subject:"password reset",
      html:`<pre>your password reset link: ${resetLink(passwordResetToken)}</pre>
            <span>Rayen</span>
      `
  });
  res.json({
    message:"password reset link were sent check your mail",
  })
});

exports.resetPassoword = catchAsync(async (req,res) => {
  const { token } = req.query;
  const { password } = req.body;
  const tokenExists = await fetchOneOr404(KeyStoreRepo,{key:token},"token invalid or expired");
  const user = await fetchOneOr404(UserRepo,{_id:tokenExists.client});
  user.password = password;
  await user.save();
  await tokenExists.delete();
  res.json({data:"your password has ben updated"});
});

exports.signup = catchAsync(async (req, res) => {
    const newUser = await UserRepo.create(req.body)
    res.json({data:newUser});
});

exports.logout = async (req, res, next) => {
  res.status(200).json({ register: true });
};