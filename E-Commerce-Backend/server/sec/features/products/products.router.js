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
import { createProductSchema, updateProductSchema, ratinigSchema } from "./products.schemas.js";

const router = express.Router();

router.post('/', validate(createProductSchema),createProduct);
router.post('/:id/rating',validate(ratinigSchema),addProductRating);
router.get('/', getAllProducts)
router.get('/category/:category', getProductByCategory)
router.get('/:id', getProductById)
router.put('/:id', validate(updateProductSchema) ,updateProduct)
router.delete('/:id', deleteProduct)

export default router

