import AppError from "../utils/appError.js";
export const validate = (schema, property = "body") => (req, res, next) => {
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
//# sourceMappingURL=validate.js.map