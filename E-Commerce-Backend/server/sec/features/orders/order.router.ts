import express from "express";
import type { Router } from "express";
import {validate} from '../../../shared/middleware/validate.js'
import { createOrderSchema, updateOrderStatusSchema } from './order.schemas.js';
import { cancelOrder, createOrder, getAllOrders, myOrders, singelOrderById, updateStatus } from './order.controller.js';
import { authMiddleware, checkRole } from "../auth/auth.middleware.js";


const OrderRoutes:Router = express.Router();

OrderRoutes.post('/', validate(createOrderSchema), authMiddleware, createOrder);

OrderRoutes.get('/my-orders', authMiddleware, myOrders);

OrderRoutes.get('/:idOrde', authMiddleware, singelOrderById);

OrderRoutes.get('/', authMiddleware, checkRole, getAllOrders);

OrderRoutes.put('/:id/status', validate(updateOrderStatusSchema), authMiddleware, checkRole, updateStatus);

OrderRoutes.put('/:id/cancel', authMiddleware, checkRole, cancelOrder);


export default OrderRoutes;