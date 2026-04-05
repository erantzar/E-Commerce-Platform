export const validate = (schema) => {
    return (req, res, next) => {
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
//# sourceMappingURL=validate.js.map