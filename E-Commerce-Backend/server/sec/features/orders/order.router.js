import express from 'express'
import {validate} from '../../../shared/middleware/validate.js'
import { createOrderSchema, updateOrderStatusSchema } from './order.schemas.js';
import { cancelOrder, createOrder, getAllOrders, myOrders, singelOrderById, updateStatus } from './order.controller.js';
import { authMiddleware, checkRole } from "../auth/auth.middleware.js";


const router = express.Router();

router.post('/', validate(createOrderSchema), authMiddleware, createOrder);

router.get('/my-orders', authMiddleware, myOrders);

router.get('/:id', authMiddleware, singelOrderById);

router.get('/', authMiddleware, checkRole, getAllOrders);

router.put('/:id/status', validate(updateOrderStatusSchema), authMiddleware, checkRole, updateStatus);

router.put('/:id/cancel', authMiddleware, checkRole, cancelOrder);


export default router;