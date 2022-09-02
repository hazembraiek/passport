import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { Types } from "mongoose";
import { ValidationError } from "../core/apiError";

export enum ValidationSource {
  BODY = "body",
  HEADER = "headers",
  QUERY = "query",
  PARAM = "params",
}

export const JoiObjectId = () =>
  Joi.string().custom((value: string, helpers) => {
    if (!Types.ObjectId.isValid(value)) return helpers.error("any.invalid");
    return value;
  }, "Object Id Validation");

export const validator =
  (
    schema: Joi.ObjectSchema,
    source: ValidationSource = ValidationSource.BODY
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    const validationOptions = {
      abortEarly: false,
      stripUnknown: true,
    };

    try {
      const { error } = schema.validate(req[source], validationOptions);

      if (!error) return next();

      const { details } = error;
      const message = details
        .map((i) => i.message.replace(/['"]+/g, ""))
        .join(",");

      next(new ValidationError(message));
    } catch (error) {
      next(error);
    }
  };
