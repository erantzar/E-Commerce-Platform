import {
    createProduct,
    addProductRating,
    getAllProducts,
    getProductById,
    getProductByCategory,
    updateProduct,
    deleteProduct
} from "./products.controller.js";
import express, { Router } from 'express';
import { validate } from "../../../shared/middleware/validate.js";
import { authMiddleware, checkRole } from "../auth/auth.middleware.js";
import { createProductSchema, updateProductSchema, ratinigSchema } from "./products.schemas.js";
import { uploadProductImage } from "../../config/cloudinary.js";


const routerProduct:Router = express.Router();
//צור מוצר -crm
routerProduct.post('/', validate(createProductSchema) ,authMiddleware, checkRole, uploadProductImage.array('images', 4), createProduct);
//דרוג - חנות
routerProduct.post('/:id/rating',validate(ratinigSchema),authMiddleware, addProductRating);
//חנות //crm
routerProduct.get('/', getAllProducts)
//חנות
routerProduct.get('/category/:cat', getProductByCategory)
//כבל מוצר חנות//crm
routerProduct.get('/:id', getProductById)
//עידקון מוצר -crm
routerProduct.put('/:id', validate(updateProductSchema),authMiddleware, checkRole, uploadProductImage.array('images', 4) ,updateProduct)
//מחיקת מוצר -crm
routerProduct.delete('/:id',authMiddleware, checkRole, deleteProduct)

export default routerProduct

