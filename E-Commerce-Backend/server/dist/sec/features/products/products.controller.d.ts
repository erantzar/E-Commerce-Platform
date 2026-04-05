import type { Request, Response, NextFunction } from "express";
/**
 * @desc    Create a new product
 * @route   POST /products
 * @access  Admin
 */
export declare const createProduct: (req: Request, res: Response, next: NextFunction) => void;
/**
 * @desc    Get all products with pagination, filtering and sorting
 * @route   GET /products
 * @access  Public
 */
export declare const getAllProducts: (req: Request, res: Response, next: NextFunction) => void;
/**
 * @desc    Get a single product by ID
 * @route   GET /products/:id
 * @access  Public
 */
export declare const getProductById: (req: Request, res: Response, next: NextFunction) => void;
/**
 * @desc    Get all products by category
 * @route   GET /products/:cat/category
 * @access  Public
 */
export declare const getProductByCategory: (req: Request, res: Response, next: NextFunction) => void;
/**
 * @desc    Add a rating to a product
 * @route   POST /products/:id/rating
 * @access  Confirmed User
 */
export declare const addProductRating: (req: Request, res: Response, next: NextFunction) => void;
/**
 * @desc    Update a product
 * @route   PUT /products/:id
 * @access  Admin
 */
export declare const updateProduct: (req: Request, res: Response, next: NextFunction) => void;
/**
 * @desc    Soft delete a product (sets isActive to false)
 * @route   DELETE /products/:id
 * @access  Admin
 */
export declare const deleteProduct: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=products.controller.d.ts.map