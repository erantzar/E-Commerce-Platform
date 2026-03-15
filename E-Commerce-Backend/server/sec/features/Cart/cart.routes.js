import express from 'express'
import { authMiddleware } from '../auth/auth.middleware.js'
import { deleteCart, deleteOwnCart, getCart, addItemsToCart, putCart,syncCart } from './cart.controller.js'
import {validate } from '../../utils/validate.js'
import {postCartSchema,syncCartSchema} from './cart.schemas.js'
const cartRoutes = express.Router()

cartRoutes.get('/',authMiddleware,getCart)

cartRoutes.post('/',authMiddleware,validate(postCartSchema),addItemsToCart)

cartRoutes.put('/:productid',authMiddleware,putCart)

cartRoutes.delete('/:productid',authMiddleware,deleteOwnCart)

cartRoutes.delete('/',authMiddleware,deleteCart)

cartRoutes.post('/sync',authMiddleware,validate(syncCartSchema),syncCart)


export default cartRoutes