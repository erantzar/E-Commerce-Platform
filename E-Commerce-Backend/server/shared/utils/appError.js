//AppError class create our own custome smart error object (message, statusCode)

class AppError extends Error {
    constructor(message, statusCode) {
        super(message); //build this 'AppError' class as standart Error object
        
        this.statusCode = statusCode;
        //if stsus error is 4xx (400/404/401/... ) its 'fail'  (client side), else 'error' (server side)
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        //a list of every file and line number the code went through before it crashed.
        Error.captureStackTrace(this, this.constructor);
    }
}
export default AppError;