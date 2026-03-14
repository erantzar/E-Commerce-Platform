import express from 'express'
import { authMiddleware } from '../auth/auth.middleware.js'
import { deleteCart, deleteOwnCart, getCart, postCart, putCart,syncCart } from './cart.controller.js'

const cartRoutes = express.Router()

cartRoutes.get('/',authMiddleware,getCart)

cartRoutes.post('/',authMiddleware,postCart)

cartRoutes.put('/:productid',authMiddleware,putCart)

cartRoutes.delete('/:productid',authMiddleware,deleteOwnCart)

cartRoutes.delete('/',authMiddleware,deleteCart)

cartRoutes.post('/sync',authMiddleware,syncCart)


export default cartRoutes