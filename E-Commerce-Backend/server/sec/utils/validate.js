export const validate = (schema) => {
    return (req, res, next) => {
  
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });
  
      if (error) {
  
        const errors = error.details.map((err) => ({
          field: err.path.join("."),
          message: err.message
        }));
  
        return res.status(422).json({
          status: 422,
          message: "Validation error",
          data: errors
        });
      }
  
      req.body = value;
      next();
    };
  };