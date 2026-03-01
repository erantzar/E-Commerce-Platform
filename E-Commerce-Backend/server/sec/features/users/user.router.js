import express from "express";
import { authMiddleware, checkPermissions,checkRole } from "../../shared/middleware/auth.middleware.js";
import * as userController from "./users.controller.js";

const router = express.Router();

/* =======================
   👤 USER (מאומת)
======================= */

// קבלת פרופיל
router.get("/profile", authMiddleware, userController.getUserById);

// עדכון פרופיל
router.put("/profile", authMiddleware, userController.updateUserProfile);
// שינוי סיסמה
router.put("/password-change", authMiddleware, userController.changePassword);

// הוספת כתובת
router.post("/addresses", authMiddleware, userController.address);

// עדכון כתובת
router.put("/addresses/:addrId", authMiddleware, userController.updateAddress);

// מחיקת כתובת
router.delete("/addresses/:addrId", authMiddleware, userController.deleteAddress);


/* =======================
   👑 ADMIN בלבד
======================= */

// קבלת כל המשתמשים
router.get("/", authMiddleware, checkRole, userController.getAllUsers);
// שינוי role
router.put("/:id/role", authMiddleware, checkPermissions,checkRole, userController.updateUserRole);

// מחיקת משתמש
router.delete("/:id", authMiddleware, checkPermissions,checkRole, userController.deleteUser);


export default router;