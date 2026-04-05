import type { Request, Response, NextFunction } from "express";
import AppError from "./appError.js";

// ─── Interfaces ───────────────────────────────────────────────

interface CastError extends Error {
  path: string;
  value: unknown;
}

interface DuplicateFieldsError extends Error {
  code: number;
  keyValue: Record<string, string>;
}

interface ValidationError extends Error {
  errors: Record<string, { message: string }>;
}

interface MulterError extends Error {
  code: "LIMIT_FILE_SIZE" | "LIMIT_UNEXPECTED_FILE" | string;
}

interface HttpError extends Error {
  statusCode?: number;
  status?: string;
  code?: number | string;
  name: string;
  stack?: string;
}

// ─── Helper Translators ───────────────────────────────────────

// Handles "CastError" (Invalid IDs like /users/123)
const handleCastErrorDB = (err: CastError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// Handles "Duplicate Fields" (Email already exists - 11000)
const handleDuplicateFieldsDB = (err: DuplicateFieldsError): AppError => {
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate field value: "${value}". Please use another value!`;
  return new AppError(message, 409);
};

// Handles "ValidationError" (Schema requirements not met)
const handleValidationErrorDB = (err: ValidationError): AppError => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

// Handles JWT Errors
const handleJWTError = (): AppError =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = (): AppError =>
  new AppError("Your token has expired! Please log in again.", 401);

// Handles Multer Errors (when the file is too large)
const handleMulterError = (err: MulterError): AppError => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return new AppError("Image size must be less than 5MB.", 400);
  } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return new AppError("You can upload only one profile image", 400);
  } else {
    return new AppError("Multer File Error", 400);
  }
};

// ─── Main Handler ─────────────────────────────────────────────

export const globalErrorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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

  let error: HttpError = Object.assign(err);
  error.message = err.message;

  if (error.name === "CastError") error = handleCastErrorDB(error as unknown as CastError);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error as unknown as DuplicateFieldsError);
  if (error.name === "ValidationError") error = handleValidationErrorDB(error as unknown as ValidationError);
  if (error.name === "JsonWebTokenError") error = handleJWTError();
  if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
  if (error.name === "MulterError") error = handleMulterError(error as unknown as MulterError);

  res.status(error.statusCode ?? 500).json({
    status: error.status,
    message: error.message,
    stack: stack,
  });
};