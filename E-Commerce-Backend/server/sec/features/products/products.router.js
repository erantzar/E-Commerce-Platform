import {
    createProduct,
    addProductRating,
    getAllProducts,
    getProductById,
    getProductByCategory,
    updateProduct,
    deleteProduct
} from "./products.controller.js";

import express from 'express'

const router = express.Router();

router.post('/', createProduct);
router.post('/:id/rating', addProductRating);
router.get('/', getAllProducts)
router.get('/category/:category', getProductByCategory)
router.get('/:id', getProductById)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

export default router

