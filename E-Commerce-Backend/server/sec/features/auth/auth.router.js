import express from 'express';
import { 
  register, 
  login, 
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  adminLogin,
  verify2FA
} from './auth.controller.js';
import {validate } from '../../utils/validate.js'
import {forgotPasswordSchema,
   loginSchema, 
   registerSchema,
    resetPasswordSchema,
     verify2FASchema}
      from './schemas/auth.schema.js'

const AuthRoutes = express.Router();

// הרשמה
AuthRoutes.post('/register',validate(registerSchema), register);

// התחברות משתמש רגיל
AuthRoutes.post('/login',validate(loginSchema), login); // כאן לא צריך authMiddleware כי המשתמש עדיין לא מחובר

// אימות מייל
AuthRoutes.get('/verify-email/:rawToken', verifyEmail);

// איפוס סיסמה - שליחת מייל
AuthRoutes.post('/password-forgot',validate(forgotPasswordSchema), forgotPassword);

// איפוס סיסמה בפועל
AuthRoutes.post('/password-reset/:token',validate(resetPasswordSchema), resetPassword);

// התחברות אדמין
AuthRoutes.post('/admin/login', validate(loginSchema),adminLogin);

// אימות 2FA לאדמין
AuthRoutes.post('/admin/verify-2fa',validate(verify2FASchema), verify2FA);

// התנתקות
//AuthRoutes.post('/logout', authMiddleware, logout);

// קבלת פרופיל עצמי
//AuthRoutes.get('/me', authMiddleware, getMe);

export default AuthRoutes;