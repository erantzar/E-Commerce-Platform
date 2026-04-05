import express from "express";
import type { Router } from "express";
import { authMiddleware,checkRole } from "../auth/auth.middleware.js";
import * as userController from "./user.controller.js";
import {validate } from '../../utils/validate.js'
import {changePasswordSchema, idValidation, updateUserProfileinSchema}from './auth.schema.js'
import { uploadUserAvatar } from "../../config/cloudinary.js";
const router:Router = express.Router();

/* =======================
   👤 USER (מאומת)
======================= */

// קבלת פרופיל
router.get("/profile", authMiddleware ,userController.getUserById);

// עדכון פרופיל
router.put("/profile",validate(updateUserProfileinSchema), authMiddleware,uploadUserAvatar.single('image') ,userController.updateUserProfile);
// שינוי סיסמה
router.put("/change-password",validate(changePasswordSchema), authMiddleware, userController.changePassword);

// הוספת כתובת
router.post("/addresses", authMiddleware, userController.addUserAdress);

// עדכון כתובת
router.put("/addresses/:addrId", authMiddleware, userController.updateAddress);

// מחיקת כתובת??
router.delete("/addresses/:addrId", authMiddleware, userController.deleteAddress);


/* =======================
   👑 ADMIN בלבד
======================= */

// קבלת כל המשתמשים
router.get("/", authMiddleware, checkRole, userController.getAllUsers);
// שינוי role
router.put("/role/:id", authMiddleware,validate(idValidation),checkRole, userController.updateUserRole);

// מחיקת משתמש
router.delete("/:id", authMiddleware,validate(idValidation),checkRole, userController.deleteUser);


export default router;