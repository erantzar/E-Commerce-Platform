import type { Request, Response, NextFunction } from "express";
import type { ObjectSchema } from "joi";
import AppError from "../utils/appError.js";

type RequestProperty = "body" | "params" | "query";

export const validate =
  (schema: ObjectSchema, property: RequestProperty = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    const input = req[property];

    const { error, value } = schema.validate(input, {
      abortEarly: false, // return ALL errors at once, not just the first one
      stripUnknown: true,
    });

    if (error) {
      console.log(error);
      const messages = error.details.map((el) => el.message).join(", ");
      return next(new AppError(messages, 400));
    }

    req[property] = value;
    next();
  };