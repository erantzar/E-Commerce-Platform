import AppError from "./appError.js";
// ─── Helper Translators ───────────────────────────────────────
// Handles "CastError" (Invalid IDs like /users/123)
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};
// Handles "Duplicate Fields" (Email already exists - 11000)
const handleDuplicateFieldsDB = (err) => {
    const value = Object.values(err.keyValue)[0];
    const message = `Duplicate field value: "${value}". Please use another value!`;
    return new AppError(message, 409);
};
// Handles "ValidationError" (Schema requirements not met)
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new AppError(message, 400);
};
// Handles JWT Errors
const handleJWTError = () => new AppError("Invalid token. Please log in again!", 401);
const handleJWTExpiredError = () => new AppError("Your token has expired! Please log in again.", 401);
// Handles Multer Errors (when the file is too large)
const handleMulterError = (err) => {
    if (err.code === "LIMIT_FILE_SIZE") {
        return new AppError("Image size must be less than 5MB.", 400);
    }
    else if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return new AppError("You can upload only one profile image", 400);
    }
    else {
        return new AppError("Multer File Error", 400);
    }
};
// ─── Main Handler ─────────────────────────────────────────────
export const globalErrorHandler = (err, req, res, next) => {
    let stack = err.stack ?? "";
    const projectFolderName = "E-Commerce-Backend";
    const pathRegex = new RegExp(`.*${projectFolderName}`, "g");
    stack = stack
        .replace(pathRegex, projectFolderName)
        .split("\n")
        .map((line) => line.trim())
        .join("\n");
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    let error = Object.assign(err);
    error.message = err.message;
    if (error.name === "CastError")
        error = handleCastErrorDB(error);
    if (error.code === 11000)
        error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
        error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError")
        error = handleJWTError();
    if (error.name === "TokenExpiredError")
        error = handleJWTExpiredError();
    if (error.name === "MulterError")
        error = handleMulterError(error);
    res.status(error.statusCode ?? 500).json({
        status: error.status,
        message: error.message,
        stack: stack,
    });
};
//# sourceMappingURL=errorConrtoller.js.map