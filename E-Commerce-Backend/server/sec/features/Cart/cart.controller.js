import Product from "../products/products.model.js";
import User from "../users/user.model.js";


/**
 * @desc    get user cart
 * @route   Get /cart
 * @access  confrimed user
 */
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

/**
 * @desc    add item to cart
 * @route   Post /cart
 * @access  confrimed user
 */
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

/**
 * @desc    add single item to cart
 * @route   Put /cart/:productId
 * @access  confrimed user
 */
export const updateSingleItemInCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { quantity } = req.body;
    const { productId } = req.params;

    if (!quantity || quantity < 1) throw new Error("Invalid quantity");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const cartItemIndex = user.cart.findIndex(
      item => item.product.equals(productId)
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({               
        status: 404,
        message: "Product not found in cart",
        data: null
      });
    }

    user.cart[cartItemIndex].quantity = quantity;
    await user.save();

    res.status(200).json({
      status: 200,
      message: "Cart item updated successfully",
      data: user.cart
    });

  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: 400,
      message: error.message || error,
      data: null
    });
  }
};

/**
 * @desc    delete item from cart
 * @route   Delete /cart/:productId
 * @access  confrimed user
 */
export const deleteSingelItemCart = async (req, res) => {
  try {
    const id = req.user.userId;
    const { productId } = req.params
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");


    const cartItemIndex = user.cart.findIndex(
      item => item.product.equals(productId)
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({               
        status: 404,
        message: "Product not found in cart",
        data: null
      });
    }

    user.cart.splice(cartItemIndex, 1);
    await user.save();

    res.status(200).json({
      status: 200,
      message: "product deleted successfully",
      data: user.cart
    })
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: 400,
      message: error.message || error,
      data: null
    })
  }
}

/**
 * @desc    delete item from cart
 * @route   Delete /cart/:productId
 * @access  confrimed user
 */
export const deleteCart = async (req, res) => {
  try {
    const id = req.user.userId;
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    user.cart = [];
    await user.save();

    res.status(200).json({
      status: 200,
      message: "postCart successfully",
      data: user.cart
    })
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: 400,
      message: error.message || error,
      data: null
    })
  }
}

/**
 * @desc    sync user local cart with DB cart
 * @route   Delete /cart/sync
 * @access  confrimed user
 */
export const syncCart = async (req, res) => {
  try {
    const userId = req.user.userId;
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

      const cartItemIndex = user.cart.findIndex(
        item => item.product.equals(product)
      );

      if (cartItemIndex === -1) {
        user.cart.push({ product, quantity });
      }else{
        user.cart[cartItemIndex].quantity += quantity;
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
