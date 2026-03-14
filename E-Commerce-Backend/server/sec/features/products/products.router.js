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
import { uploadProductImage } from "../../config/cloudinary.js";


const routerProduct = express.Router();

routerProduct.post('/', validate(createProductSchema),createProduct);
routerProduct.post('/:id/rating',validate(ratinigSchema),addProductRating);
routerProduct.get('/', getAllProducts)
routerProduct.get('/category/:category', getProductByCategory)
routerProduct.get('/:id', getProductById)
routerProduct.put('/:id', validate(updateProductSchema) ,updateProduct)
routerProduct.delete('/:id', deleteProduct)

export default routerProduct

