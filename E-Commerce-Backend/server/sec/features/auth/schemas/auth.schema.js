import Joi from "joi";

export const registerSchema = Joi.object({
    name:Joi.string().min(2).required(),

  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .min(6)
    .required()

});

export const loginSchema = Joi.object({

  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .min(6)
    .required()

});

export const forgotPasswordSchema = Joi.object({

    email: Joi.string()
      .email()
      .required()
  
  });

  export const resetPasswordSchema = Joi.object({

    password: Joi.string()
    .min(6)
    .required()
  
  });

  export const verify2FASchema = Joi.object({

    code: Joi.string().length(6).required()
  
  });


