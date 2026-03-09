import {
    createProduct,
    addProductRating,
    getAllProducts,
    getProductById,
    getProductByCategory,
    updateProduct,
    deleteProduct
} from "./products.controller.js";
import express from 'express';
import { validate } from "../../../shared/middleware/validate.js";
import { authMiddleware, checkRole } from "../auth/auth.middleware.js";
import { createProductSchema, updateProductSchema, ratinigSchema } from "./products.schemas.js";


const router = express.Router();



router.get('/:id', getProductById)

router.get('/category/:category', getProductByCategory)

router.get('/', getAllProducts)

router.post('/',validate(createProductSchema),authMiddleware, checkRole, createProduct);

router.put('/:id', validate(updateProductSchema),authMiddleware, checkRole ,updateProduct)

router.delete('/:id',authMiddleware, checkRole, deleteProduct)

router.post('/:id/rating',validate(ratinigSchema),authMiddleware,addProductRating);

export default router

