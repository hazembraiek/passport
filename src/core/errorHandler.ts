import { ApiError } from "./apiError";
import { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  ApiError.handle(err, res);
};

export default errorHandler;
