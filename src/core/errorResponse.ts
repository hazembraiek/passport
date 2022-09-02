import { Response } from "express";

enum ResponseStatus {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  VALIDATION_ERROR = 422,
  INTERNAL_ERROR = 500,
}

class ApiResponse {
  constructor(
    protected statusCode: number,
    protected status: string,
    protected message: string
  ) {}

  protected prepare<T extends ApiResponse>(
    res: Response,
    response: T
  ): Response {
    return res.status(this.statusCode).json({ message: response.message });
  }

  public send(res: Response): Response {
    return this.prepare<ApiResponse>(res, this);
  }
}

export class BadRequestResponse extends ApiResponse {
  constructor(message = "Bad Parameters") {
    super(ResponseStatus.BAD_REQUEST, "fail", message);
  }
}

export class NotFoundResponse extends ApiResponse {
  constructor(message = "Not Found") {
    super(ResponseStatus.NOT_FOUND, "fail", message);
  }
}
export class ValidationFailResponse extends ApiResponse {
  constructor(message = "Validation Error") {
    super(ResponseStatus.VALIDATION_ERROR, "fail", message);
  }
}
export class InternelResponse extends ApiResponse {
  constructor(message = "Server Error") {
    super(ResponseStatus.INTERNAL_ERROR, "fail", message);
  }
}
export class AuthFailureResponse extends ApiResponse {
  constructor(message = "Login Error") {
    super(ResponseStatus.UNAUTHORIZED, "fail", message);
  }
}

export class InvalidAccessToken extends ApiResponse {
  constructor(message = "Invalid Access Token") {
    super(ResponseStatus.UNAUTHORIZED, "fail", message);
  }
}
