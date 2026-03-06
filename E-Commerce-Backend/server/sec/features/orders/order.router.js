import express from 'express'
import {validate} from '../../../shared/middleware/validate.js'
import { createOrderSchema, updateOrderStatusSchema } from './order.schemas.js';
import { cancelOrder, createOrder, getAllOrders, myOrders, singelOrderById, updateStatus } from './order.controller.js';

const router = express.Router();

router.post('/', validate(createOrderSchema),createOrder);
router.get('/my-orders/:id', myOrders);
router.get('/:id', singelOrderById);
router.get('/', getAllOrders);
router.put('/:id/status', validate(updateOrderStatusSchema), updateStatus);
router.put('/:id/cancel', cancelOrder);


export default router;