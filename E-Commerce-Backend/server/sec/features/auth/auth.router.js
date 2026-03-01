import express from 'express';
import { 
  register, 
  login, 
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  adminLogin, 
  verify2FA, 
  logout, 
  getMe 
} from '../auth/auth.controller.js';
import { authMiddleware } from '../../shared/middleware/auth.middleware.js';

const AuthRoutes = express.Router();

// הרשמה
AuthRoutes.post('/register', register);

// התחברות משתמש רגיל
AuthRoutes.post('/login', login); // כאן לא צריך authMiddleware כי המשתמש עדיין לא מחובר

// אימות מייל
AuthRoutes.get('/verify-email/:token', verifyEmail);

// איפוס סיסמה - שליחת מייל
AuthRoutes.post('/password-forgot', forgotPassword);

// איפוס סיסמה בפועל
AuthRoutes.post('/password-reset/:token', resetPassword);

// התחברות אדמין
AuthRoutes.post('/admin/login', adminLogin);

// אימות 2FA לאדמין
AuthRoutes.post('/admin/verify-2fa', verify2FA);

// התנתקות
AuthRoutes.post('/logout', authMiddleware, logout);

// קבלת פרופיל עצמי
AuthRoutes.get('/me', authMiddleware, getMe);

export default AuthRoutes;