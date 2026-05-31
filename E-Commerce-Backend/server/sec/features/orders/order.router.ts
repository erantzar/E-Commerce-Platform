import express from "express";
import type { Router } from "express";
import {validate} from '../../../shared/middleware/validate.js'
import { createOrderSchema, updateOrderStatusSchema } from './order.schemas.js';
import { cancelOrder, createOrder, getAllOrders, myOrders, singelOrderById, updateStatus } from './order.controller.js';
import { authMiddleware, checkRole } from "../auth/auth.middleware.js";


const OrderRoutes:Router = express.Router();
//צור אזמנה  - חנות
OrderRoutes.post('/', validate(createOrderSchema), authMiddleware, createOrder);
//חנות - לכבל את האזמנו שלי
OrderRoutes.get('/my-orders', authMiddleware, myOrders);
//crm  -  לימצו אזמנה לפי מזה יחיד
OrderRoutes.get('/:idOrde', authMiddleware, singelOrderById);
//crm - לכבל את הכול ההזמנות
OrderRoutes.get('/', authMiddleware, checkRole, getAllOrders);
//חנות 
OrderRoutes.put('/:id/status', validate(updateOrderStatusSchema), authMiddleware, checkRole, updateStatus);
//crm
OrderRoutes.put('/:id/cancel', authMiddleware, checkRole, cancelOrder);


export default OrderRoutes;