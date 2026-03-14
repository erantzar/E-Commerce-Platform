import Joi from "joi";



export const postCartSchema = Joi.object({

    product: Joi.string().length(24).hex().required(),
    quantity:Joi.number().optional()
});



  export const syncCartSchema = Joi.object({

    items: Joi.array()
  
  });

 

