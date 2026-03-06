import Joi from "joi";

export const createProductSchema = Joi.object({
    name:         Joi.string().required().min(2).max(100),
    description:  Joi.string().required(),
    price:        Joi.number().required().min(0),
    category:     Joi.string().valid('electronics', 'clothing', 'food', 'home', 'beauty').required(),
    stock:        Joi.number().min(0).default(0),
    images:       Joi.array().items(Joi.string()).default([])
})

export const updateProductSchema = Joi.object({
    name:        Joi.string().min(2).max(100),
    description: Joi.string(),
    price:       Joi.number().min(0),
    category:    Joi.string().valid('electronics', 'clothing', 'food', 'home', 'beauty'),
    stock:       Joi.number().min(0),
    images:      Joi.array().items(Joi.string()),
    isActive:    Joi.boolean()
  }).min(1); // at least one field required on update

export const ratinigSchema = Joi.object({
  user: Joi.string()
    .hex()
    .length(24) //MongoDB ObjectIds are always 24 character hex strings
    .required(),

  rating: Joi.number()
    .min(1)
    .max(5)
    .required(),
    
  comment: Joi.string()
    .min(2)
    .max(500)
    .optional()
})