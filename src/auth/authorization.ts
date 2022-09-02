import { NextFunction, Request, Response } from "express";

exports.authorization = (req: Request, res: Response, next: NextFunction) => {
  next();
};
