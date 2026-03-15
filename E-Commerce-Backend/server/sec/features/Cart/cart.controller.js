import Product from "../products/products.model.js";
import User from "../users/user.model.js";

export const getCart = async (req, res) => {
  try {

    const id = req.user.userId;
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    res.status(200).json({
      status: 200,
      message: "get Cart successfully",
      data: user.cart
    })
  } catch (error) {
    console.log("User not found")
    console.log(error);
    res.status(400).json({
      status: 400,
      message: error.message || error,
      data: null
    })
  }
}
export const addItemsToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity = 1 } = req.body;

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");
    
    console.log(user.cart)
    
    const cartItemIndex = user.cart.findIndex(
      
      item => {
        return item.product.equals(productId)
      }
    );
    
    if (cartItemIndex !== -1) {
      user.cart[cartItemIndex].quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();

    res.status(200).json({
      status: 200,
      message: "Product added to cart",
      data: user.cart
    });

  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: 400,
      message: error.message,
      data: null
    });
  }
};
export const putCart = async (req, res) => {
  try {
    const id = req.user.id;
    const { quantity } = req.body;
    const { productid } = req.params

    const user = await User.findById(id).select("-password");
    if (!user) throw new Error("User not found");
    let chec = false
    for (let i = 0; i < user.cart.length; i++) {
      if (user.cart[i].product.toString() === productid) {
        user.cart[i].quantity = quantity
        console.log(user);
        await user.save()
        chec = true
        break;
      }
    }
    if (!chec) {
      res.status(400).json({
        status: 400,
        message: "לא מצנו את המוצר",
        data: null
      })
    }
    res.status(200).json({
      status: 200,
      message: "postCart successfully",
      data: user.cart
    })
  } catch (error) {
    console.log("User not found(postCart)")
    console.log(error);
    res.status(400).json({
      status: 400,
      message: error.message || error,
      data: null
    })
  }
}
export const deleteOwnCart = async (req, res) => {
  try {
    const id = req.user.id;
    const { productid } = req.params
    const user = await User.findById(id).select("-password");
    if (!user) throw new Error("User not found");

    for (let i = 0; i < user.cart.length; i++) {
      if (user.cart[i].product.toString() === productid) {
        user.cart.splice(i, 1); // מוחק את הפריט מהמערך
        await user.save();
        break;
      }
    }
    res.status(200).json({
      status: 200,
      message: "postCart successfully",
      data: user.cart
    })
  } catch (error) {
    console.log("User not found(postCart)")
    console.log(error);
    res.status(400).json({
      status: 400,
      message: error.message || error,
      data: null
    })
  }
}
export const deleteCart = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id).select("-password");
    if (!user) throw new Error("User not found");

    user.cart = [];
    await user.save();

    res.status(200).json({
      status: 200,
      message: "postCart successfully",
      data: user.cart
    })
  } catch (error) {
    console.log("User not found(postCart)")
    console.log(error);
    res.status(400).json({
      status: 400,
      message: error.message || error,
      data: null
    })
  }
}
export const syncCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = req.body.items; // מערך של אובייקטים { product, quantity }

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Items must be a non-empty array");
    }

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    for (const { product, quantity = 1 } of items) {
      const productExists = await Product.findById(product);
      if (!productExists) {
        return res.status(400).json({
          status: 400,
          message: `Product not found: ${product}`,
          data: null
        });
      }

      const cartItem = user.cart.find(
        item => item.product.toString() === product
      );

      if (cartItem) {
        cartItem.quantity += quantity;
      } else {
        user.cart.push({
          product,
          quantity
        });
      }
    }

    await user.save();

    res.status(200).json({
      status: 200,
      message: "Products added to cart",
      data: user.cart
    });

  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: 400,
      message: error.message,
      data: null
    });
  }
};
