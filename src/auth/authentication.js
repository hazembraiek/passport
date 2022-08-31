const validator = require("./../middlewares/validator");
const { getAccessToken, verifyToken } = require("./authUtils");
const userRepository = require("./../db/repository/userRepo");
const catchAsync = require("../utils/catchAsync");
const {
  AuthFailureError,
  TokenExpiredError,
  BadRequestError,
} = require("../core/apiError");

module.exports = catchAsync(async (req, res, next) => {
  const accessToken = getAccessToken(req.headers.authorization);

  try {
    const decodedToken = await verifyToken(accessToken);
    const user = await userRepository.findById(decodedToken.id);
    if (!user) throw new AuthFailureError("User not registered");
    req.user = user;
    return next();
  } catch (e) {
    if (e instanceof TokenExpiredError) throw new AccessTokenError(e.message);
    throw new BadRequestError(e.message);
  }
});
