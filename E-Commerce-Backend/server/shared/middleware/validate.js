import AppError from "../utils/appError.js";


export const validate = (schema, proparty = "body") => (req, res, next) => {

    const input = req[proparty];
    const { error, value } = schema.validate(input, {
      abortEarly: false  // return ALL errors at once, not just the first one
    });
  
    if (error) {
       console.log(error);
       
      const messages = error.details.map(el => el.message).join(', ');
      return next(new AppError(messages, 400));
    }
  
    req[proparty] = value; // replace body with the validated & cleaned value
    next();
  };