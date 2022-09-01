const ResponseStatus = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  INTERNAL_ERROR: 500,
};

class ApiResponse {
  constructor(statusCode, status, message) {
    this.statusCode = statusCode;
    this.status = status;
    this.message = message;
  }

  send(res) {
    return res
      .status(this.statusCode)
      .json({ status: this.status, message: this.message });
  }
}

class BadRequestResponse extends ApiResponse {
  constructor(message = "Bad Parameters") {
    super(ResponseStatus.BAD_REQUEST, "fail", message);
  }
}

class NotFoundResponse extends ApiResponse {
  constructor(message = "Not Found") {
    super(ResponseStatus.NOT_FOUND, "fail", message);
  }
}
class ValidationFailResponse extends ApiResponse {
  constructor(message = "Validation Error") {
    super(ResponseStatus.VALIDATION_ERROR, "fail", message);
  }
}
class InternelResponse extends ApiResponse {
  constructor(message = "Server Error") {
    super(ResponseStatus.INTERNAL_ERROR, "fail", message);
  }
}
class AuthFailureResponse extends ApiResponse {
  constructor(message = "Login Error") {
    super(ResponseStatus.UNAUTHORIZED, "fail", message);
  }
}
class InvalidAccessToken extends ApiResponse {
  constructor(message = "Invalid Access Token") {
    super(ResponseStatus.UNAUTHORIZED, "fail", message);
  }
}

module.exports = {
  BadRequestResponse,
  NotFoundResponse,
  ValidationFailResponse,
  InternelResponse,
  AuthFailureResponse,
  InvalidAccessToken,
};
