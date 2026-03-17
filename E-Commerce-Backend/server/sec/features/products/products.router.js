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

routerProduct.post('/', validate(createProductSchema) ,authMiddleware, checkRole, uploadProductImage.array('images', 4), createProduct);
routerProduct.post('/:id/rating',validate(ratinigSchema),authMiddleware, addProductRating);
routerProduct.get('/', getAllProducts)
routerProduct.get('/category/:cat', getProductByCategory)
routerProduct.get('/:id', getProductById)
routerProduct.put('/:id', validate(updateProductSchema),authMiddleware, checkRole, uploadProductImage.array('images', 4) ,updateProduct)
routerProduct.delete('/:id',authMiddleware, checkRole, deleteProduct)

export default routerProduct

