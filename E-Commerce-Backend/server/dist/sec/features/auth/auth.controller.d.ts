import type { Request, Response } from "express";
/**
 * @desc    register new user
 * @route   POST AuthRoutes/register
 * @access  all users
 */
export declare const register: (req: Request, res: Response) => Promise<void>;
/**
 * @desc    verify user email
 * @route   GET AuthRoutes/verify-email/:rawToken
 * @access  registered user
 */
export declare const verifyEmail: (req: Request, res: Response) => Promise<void | Response>;
/**
 * @desc    login user
 * @route   POST AuthRoutes/login
 * @access  confirmed user
 */
export declare const login: (req: Request, res: Response) => Promise<void>;
/**
 * @desc    send link for reset password
 * @route   POST AuthRoutes/password-forgot
 * @access  confirmed user
 */
export declare const forgotPassword: (req: Request, res: Response) => Promise<void>;
/**
 * @desc    reset password
 * @route   POST AuthRoutes/password-reset/:token
 * @access  confirmed user
 */
export declare const resetPassword: (req: Request, res: Response) => Promise<void | Response>;
/**
 * @desc    admin login
 * @route   POST AuthRoutes/admin/login
 * @access  Admin
 */
export declare const adminLogin: (req: Request, res: Response) => Promise<void>;
/**
 * @desc    verify admin 2FA
 * @route   POST AuthRoutes/admin/verify-2fa
 * @access  Admin
 */
export declare const verify2FA: (req: Request, res: Response) => Promise<void>;
/**
 * @desc    get my user info
 * @route   GET AuthRoutes/me
 * @access  confirmed user
 */
export declare const getMe: (req: Request, res: Response) => Promise<void>;
/**
 * @desc    logout
 * @route   POST/PUT AuthRoutes/logout
 * @access  confirmed user
 */
export declare const logout: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map