import type { Request, Response } from "express";
/**
 * @desc    get user by Id
 * @route   GET /users/profile
 * @access  confirmed user
 */
export declare const getUserById: (req: Request, res: Response) => Promise<void>;
/**
 * @desc    update user profile
 * @route   PUT /users/profile
 * @access  confirmed user
 */
export declare const updateUserProfile: (req: Request, res: Response) => Promise<void | Response>;
/**
 * @desc    change user password
 * @route   PUT /users/change-password
 * @access  confirmed user
 */
export declare const changePassword: (req: Request, res: Response) => Promise<void>;
/**
 * @desc    update user address
 * @route   PUT /users/addresses/:addrId
 * @access  confirmed user
 */
export declare const updateAddress: (req: Request, res: Response) => Promise<void>;
/**
 * @desc    add new user address
 * @route   POST /users/addresses
 * @access  confirmed user
 */
export declare const addUserAdress: (req: Request, res: Response) => Promise<void>;
/**
 * @desc    delete user address
 * @route   DELETE /users/addresses/:addrId
 * @access  confirmed user
 */
export declare const deleteAddress: (req: Request, res: Response) => Promise<void>;
/**
 * @desc    get all users
 * @route   GET /users/
 * @access  Admin
 */
export declare const getAllUsers: (req: Request, res: Response) => Promise<void>;
/**
 * @desc    update user role [ADMIN/CUSTOMER]
 * @route   PUT /users/role/:id
 * @access  Admin
 */
export declare const updateUserRole: (req: Request, res: Response) => Promise<void>;
/**
 * @desc    delete user by id
 * @route   DELETE /users/:id
 * @access  Admin
 */
export declare const deleteUser: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=user.controller.d.ts.map