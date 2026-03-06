import AppError from "./appError.js";


// --- HELPER TRANSLATORS ---

// 1. Handles "CastError" (Invalid IDs like /users/123)
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

// 2. Handles "Duplicate Fields" (Email already exists - 11000)
const handleDuplicateFieldsDB = err => {
    const value = Object.values(err.keyValue)[0];
    const message = `Duplicate field value: "${value}". Please use another value!`;
    return new AppError(message, 409); // 409 = Conflict
};

// 3. Handles "ValidationError" (Schema requirements not met)
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

// 4. Handles JWT Errors (If you add authentication later)
const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

// --- THE MAIN HANDLER ---

export const globalErrorHandler = (err, req, res, next) => {

    //Help cleaning the error stack path to
    let stack = err.stack;
    const projectFolderName = 'E-Commerce-Backend';
    const pathRegex = new RegExp(`.*${projectFolderName}`, 'g');
    // 1. Clean the paths
    // 2. Split by newline to create an Array
    // 3. Filter out empty lines or node_modules if you want
    stack = stack
        .replace(pathRegex, projectFolderName)
        .split('\n')
        .map(line => line.trim()); // Removes extra spaces


    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Start with a copy of the original error
    let error = Object.assign(err);
    error.message = err.message;

    // Detect and translate specific MongoDB/Mongoose errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // Send the response
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stack: stack
    });
};