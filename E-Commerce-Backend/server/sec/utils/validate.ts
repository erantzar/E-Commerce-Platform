import type { ObjectSchema } from "joi";
import type { Request, Response, NextFunction } from "express";

export const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      res.status(422).json({
        status: 422,
        message: "Validation error",
        data: errors,
      });
      return;
    }

    req.body = value;
    next();
  };
};