const Joi = require("joi");
const { Types } = require("mongoose");
const { ValidationError } = require("../core/apiError");

exports.ValidationSource = {
  BODY: "body",
  HEADER: "headers",
  QUERY: "query",
  PARAM: "params",
};

// export const JoiUrlEndpoint = () =>
//   Joi.string().custom((value: string, helpers) => {
//     if (value.includes("://")) return helpers.error("any.invalid");
//     return value;
//   }, "Url Endpoint Validation");

// export const JoiAuthBearer = () =>
//   Joi.string().custom((value: string, helpers) => {
//     if (!value.startsWith("Bearer ")) return helpers.error("any.invalid");
//     if (!value.split(" ")[1]) return helpers.error("any.invalid");
//     return value;
//   }, "Authorization Header Validation");

module.exports =
  (schema, source = this.ValidationSource.BODY) =>
  (req, res, next) => {
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

exports.JoiObjectId = () =>
  Joi.string().custom((value, helpers) => {
    if (!Types.ObjectId.isValid(value)) return helpers.error("any.invalid");
    return value;
  }, "Object Id Validation");
