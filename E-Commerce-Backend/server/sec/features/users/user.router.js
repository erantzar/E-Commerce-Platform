import express from "express";
import { authMiddleware, checkPermissions,checkRole } from "../auth/auth.middleware.js";
import * as userController from "./user.controller.js";
import {validate } from '../../utils/validate.js'
import {changePasswordSchema, updateUserProfileinSchema}
      from './schemas/auth.schema.js'

const router = express.Router();

/* =======================
   👤 USER (מאומת)
======================= */

// קבלת פרופיל
router.get("/profile", authMiddleware, userController.getUserById);

// עדכון פרופיל
router.put("/profile",validate(updateUserProfileinSchema), authMiddleware, userController.updateUserProfile);
// שינוי סיסמה
router.put("/password-change",validate(changePasswordSchema), authMiddleware, userController.changePassword);

// הוספת כתובת
router.post("/addresses", authMiddleware, userController.address);

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
router.put("/role/:id", authMiddleware,checkRole, userController.updateUserRole);

// מחיקת משתמש
router.delete("/:id", authMiddleware,checkRole, userController.deleteUser);


export default router;