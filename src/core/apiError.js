const {
  BadRequestResponse,
  NotFoundResponse,
  ValidationFailResponse,
  InternelResponse,
  AuthFailureResponse,
  InvalidAccessToken,
} = require("./errorResponse");

const ErrorType = {
  BAD_TOKEN: "BadTokenError",
  TOKEN_EXPIRED: "TokenExpiredError",
  UNAUTHORIZED: "AuthFailureError",
  ACCESS_TOKEN: "AccessTokenError",
  INTERNAL: "InternalError",
  NOT_FOUND: "NotFoundError",
  NO_ENTRY: "NoEntryError",
  NO_DATA: "NoDataError",
  BAD_REQUEST: "BadRequestError",
  FORBIDDEN: "ForbiddenError",
  VALIDATION_FAIL: "ValidationFail",
};

class ApiError extends Error {
  constructor(type, message = "error") {
    super(message);
    this.type = type;
  }

  static handle(err, res) {
    switch (err.type) {
      case ErrorType.UNAUTHORIZED:
        return new AuthFailureResponse(err.message).send(res);
      case ErrorType.NOT_FOUND:
      case ErrorType.NO_DATA:
        return new NotFoundResponse(err.message).send(res);
      case ErrorType.BAD_REQUEST:
        return new BadRequestResponse(err.message).send(res);
      case ErrorType.VALIDATION_FAIL:
        return new ValidationFailResponse(err.message).send(res);
      case ErrorType.BAD_TOKEN:
      case ErrorType.TOKEN_EXPIRED:
      case ErrorType.UNAUTHORIZED:
        return new AuthFailureResponse(err.message).send(res);
      case ErrorType.ACCESS_TOKEN:
        return new InvalidAccessToken(err.message).send(res);
      default: {
        let message = err.message;
        if (process.env.NODE_ENV === "production")
          message = "Something wrong happened.";
        return new InternelResponse(message).send(res);
      }
    }
  }
}

class BadRequestError extends ApiError {
  constructor(message = "Bad Request") {
    super(ErrorType.BAD_REQUEST, message);
  }
}

class NotFoundError extends ApiError {
  constructor(message = "Not Found") {
    super(ErrorType.NOT_FOUND, message);
  }
}

class NoDataError extends ApiError {
  constructor(message = "No data available") {
    super(ErrorType.NO_DATA, message);
  }
}
class ValidationError extends ApiError {
  constructor(message = "Validation Fail") {
    super(ErrorType.VALIDATION_FAIL, message);
  }
}
class UnauthorizedError extends ApiError {
  constructor(message = "Login Failed") {
    super(ErrorType.UNAUTHORIZED, message);
  }
}
class AuthFailureError extends ApiError {
  constructor(message = "YOU NOT LOGGED IN") {
    super(ErrorType.UNAUTHORIZED, message);
  }
}

class BadTokenError extends ApiError {
  constructor(message = "Token is not valid") {
    super(ErrorType.BAD_TOKEN, message);
  }
}

class TokenExpiredError extends ApiError {
  constructor(message = "Token is expired") {
    super(ErrorType.TOKEN_EXPIRED, message);
  }
}
class AccessTokenError extends ApiError {
  constructor(message = "Invalid access token") {
    super(ErrorType.TOKEN_EXPIRED, message);
  }
}

module.exports = {
  ApiError,
  NoDataError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ValidationError,
  AuthFailureError,
  BadTokenError,
  TokenExpiredError,
  AccessTokenError,
};
