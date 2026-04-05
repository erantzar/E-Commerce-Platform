import Joi from "joi";
export const updateUserProfileinSchema = Joi.object({
    email: Joi.string()
        .email()
        .required(),
    name: Joi.string().min(2).required()
});
export const changePasswordSchema = Joi.object({
    oldPassword: Joi.string()
        .min(8)
        .required(),
    newPassword: Joi.string()
        .min(8)
        .max(12)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
        .required()
        .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
        'string.min': 'Password must be at least 8 characters long.',
        'string.max': 'Password cannot exceed 12 characters.',
        'any.required': 'Password is a required field.'
    })
});
export const verify2FASchema = Joi.object({
    code: Joi.string().length(6).required()
});
export const idValidation = Joi.object({
    id: Joi.string().length(24).hex().required()
});
//# sourceMappingURL=auth.schema.js.map