import type { Request, Response } from "express";
/**
 * @desc    get user cart
 * @route   GET /cart
 * @access  confirmed user
 */
export declare const getCart: (req: Request, res: Response) => Promise<void>;
/**
 * @desc    add item to cart
 * @route   POST /cart
 * @access  confirmed user
 */
export declare const addItemsToCart: (req: Request, res: Response) => Promise<void>;
/**
 * @desc    update single item in cart
 * @route   PUT /cart/:productId
 * @access  confirmed user
 */
export declare const updateSingleItemInCart: (req: Request, res: Response) => Promise<void>;
/**
 * @desc    delete single item from cart
 * @route   DELETE /cart/:productId
 * @access  confirmed user
 */
export declare const deleteSingelItemCart: (req: Request, res: Response) => Promise<void>;
/**
 * @desc    clear entire cart
 * @route   DELETE /cart
 * @access  confirmed user
 */
export declare const deleteCart: (req: Request, res: Response) => Promise<void>;
/**
 * @desc    sync local cart with DB cart
 * @route   POST /cart/sync
 * @access  confirmed user
 */
export declare const syncCart: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=cart.controller.d.ts.map