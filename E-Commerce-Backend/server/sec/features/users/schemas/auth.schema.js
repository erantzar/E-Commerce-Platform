import Joi from "joi";



export const updateUserProfileinSchema = Joi.object({

  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .min(6)
    .required()

});



  export const changePasswordSchema = Joi.object({

    oldPassword: Joi.string()
    .min(6)
    .required(),
    newPassword:Joi.string()
    .min(6)
    .required(),
  
  });

  export const verify2FASchema = Joi.object({

    code: Joi.string().length(6).required()
  
  });


