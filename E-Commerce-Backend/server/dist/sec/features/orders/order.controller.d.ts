import type { Request, Response, NextFunction } from "express";
/**
 * @desc    Create a new Order
 * @route   POST /orders/
 * @access  Confirmed User
 */
export declare const createOrder: (req: Request, res: Response, next: NextFunction) => void;
/**
 * @desc    Get my orders
 * @route   GET /orders/my-orders
 * @access  Confirmed User
 */
export declare const myOrders: (req: Request, res: Response, next: NextFunction) => void;
/**
 * @desc    Get single order by Id
 * @route   GET /orders/:id
 * @access  Confirmed User / Admin
 */
export declare const singelOrderById: (req: Request, res: Response, next: NextFunction) => void;
/**
 * @desc    Get all orders
 * @route   GET /orders
 * @access  Admin
 */
export declare const getAllOrders: (req: Request, res: Response, next: NextFunction) => void;
/**
 * @desc    Update status of order by Id
 * @route   PUT /orders/:id/status
 * @access  Admin
 */
export declare const updateStatus: (req: Request, res: Response, next: NextFunction) => void;
/**
 * @desc    Cancel order
 * @route   PUT /orders/:id/cancel
 * @access  Admin
 */
export declare const cancelOrder: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=order.controller.d.ts.map