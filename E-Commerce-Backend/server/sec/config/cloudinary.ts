import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
 import type { FileFilterCallback } from "multer";
import type { Request } from "express";
import AppError from "../../shared/utils/appError.js";

// ─── Cloudinary Config ────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDE_NAME as string,
  api_key:    process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

// ─── Shared Config ────────────────────────────────────────────
const fileSizeLimit = 5 * 1024 * 1024; // 5MB

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Only jpg, png and webp images are allowed.", 400) as unknown as null, false);
  }
};

// ─── Product Images Storage ───────────────────────────────────
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ecommerce/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  } as object,
});

// ─── User Avatar Storage ──────────────────────────────────────
const userStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ecommerce/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  } as object,
});

// ─── Multer Instances ─────────────────────────────────────────
export const uploadProductImage = multer({
  storage: productStorage,
  limits: { fileSize: fileSizeLimit },
  fileFilter,
});

export const uploadUserAvatar = multer({
  storage: userStorage,
  limits: { fileSize: fileSizeLimit },
  fileFilter,
});

export default cloudinary;