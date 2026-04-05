import type { Request, Response } from "express";
import { Schema, model, Document, Types } from 'mongoose'; // הוסיפי את Types כאן
import Product from "../products/products.model.js";
import User from "../users/user.model.js";

/**
 * @desc    get user cart
 * @route   GET /cart
 * @access  confirmed user
 */
export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.user!;
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    res.status(200).json({
      status: 200,
      message: "Cart fetched successfully",
      data: user.cart,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      status: 400,
      message: err.message || String(error),
      data: null,
    });
  }
};

/**
 * @desc    add item to cart
 * @route   POST /cart
 * @access  confirmed user
 */
export const addItemsToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.user!;
    const { productId, quantity = 1 } = req.body as {
      productId: Types.ObjectId ;
      quantity?: number;
    };

    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    const cartItemIndex = user.cart.findIndex((item) =>
      item.product.equals(productId)
    );

    if (cartItemIndex !== -1) {
      (user.cart[cartItemIndex] as any).quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();

    res.status(200).json({
      status: 200,
      message: "Product added to cart",
      data: user.cart,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      status: 400,
      message: err.message,
      data: null,
    });
  }
};

/**
 * @desc    update single item in cart
 * @route   PUT /cart/:productId
 * @access  confirmed user
 */
export const updateSingleItemInCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.user!;
    const { quantity } = req.body as { quantity: number };
    const { productId } = req.params as {productId: string};

    if (!quantity || quantity < 1) throw new Error("Invalid quantity");

    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    const cartItemIndex = user.cart.findIndex((item) =>
      item.product.equals(productId)
    );

    if (cartItemIndex === -1) {
      res.status(404).json({
        status: 404,
        message: "Product not found in cart",
        data: null,
      });
      return;
    }

    (user.cart[cartItemIndex] as any).quantity = quantity;
    await user.save();

    res.status(200).json({
      status: 200,
      message: "Cart item updated successfully",
      data: user.cart,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      status: 400,
      message: err.message || String(error),
      data: null,
    });
  }
};

/**
 * @desc    delete single item from cart
 * @route   DELETE /cart/:productId
 * @access  confirmed user
 */
export const deleteSingelItemCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.user!;
    const { productId } = req.params as {productId:string};

    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    const cartItemIndex = user.cart.findIndex((item) =>
      item.product.equals(productId)
    );

    if (cartItemIndex === -1) {
      res.status(404).json({
        status: 404,
        message: "Product not found in cart",
        data: null,
      });
      return;
    }

    user.cart.splice(cartItemIndex, 1);
    await user.save();

    res.status(200).json({
      status: 200,
      message: "Product deleted successfully",
      data: user.cart,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      status: 400,
      message: err.message || String(error),
      data: null,
    });
  }
};

/**
 * @desc    clear entire cart
 * @route   DELETE /cart
 * @access  confirmed user
 */
export const deleteCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.user!;
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    user.cart = [];
    await user.save();

    res.status(200).json({
      status: 200,
      message: "Cart cleared successfully",
      data: user.cart,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      status: 400,
      message: err.message || String(error),
      data: null,
    });
  }
};

/**
 * @desc    sync local cart with DB cart
 * @route   POST /cart/sync
 * @access  confirmed user
 */
export const syncCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.user!;
    const items = req.body.items as { product: Types.ObjectId; quantity?: number }[];

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Items must be a non-empty array");
    }

    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    for (const { product, quantity = 1 } of items) {
      const productExists = await Product.findById(product);
      if (!productExists) {
        res.status(400).json({
          status: 400,
          message: `Product not found: ${product}`,
          data: null,
        });
        return;
      }

      const cartItemIndex = user.cart.findIndex((item) =>
        item.product.equals(product)
      );

      if (cartItemIndex === -1) {
        user.cart.push({ product, quantity });
      } else {
        (user.cart[cartItemIndex] as any).quantity += quantity;
      }
    }

    await user.save();

    res.status(200).json({
      status: 200,
      message: "Cart synced successfully",
      data: user.cart,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      status: 400,
      message: err.message,
      data: null,
    });
  }
};