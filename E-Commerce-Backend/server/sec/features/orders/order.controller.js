import { catchAsync } from "../../../shared/middleware/catchAsync.js";
import AppError from "../../../shared/utils/appError.js";
import Product from "../products/products.model.js";
import User from '../users/user.model.js'
import { sendOrderEmail } from "../../utils/mailer.js";
import Order from "./order.model.js";
import { sendOrderStatusEmail } from "../../utils/mailer.js";

/**
 * @desc    Create a new Order
 * @route   POST http://localhost:3000/orders/
 * @access  Confrimed User
 */
export const createOrder = catchAsync(async (req, res, next) => {
  const { items, addressId, paymentMethod, notes, shipingCost } = req.body;
  const userId = req.user.userId

  //getting the adress object from user
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const address = user.addresses.id(addressId);
  if (!address) throw new Error("Address not found");

  const shippingAddress = {
    city: address.city,
    street: address.street,
    houseNumber: address.houseNumber,
    zip: address.zip,
  }

  if (!items || items.length === 0) {
    return next(new AppError('An order must contain at least one item.', 400));
  }



  const stockUpdates = [];
  const resolvedItems = [];
  let totalPrice = 0;


  for (const orderItem of items) {
    const product = await Product.findById(orderItem.product).select('stock price name images isActive sold');

    if (!product) {
      return next(new AppError(`Product with ID ${orderItem.product} was not found.`, 404));
    }


    if (!product.isActive) {
      return next(new AppError(`product ${product.name} is unactive`, 404));
    }

    if (orderItem.quantity > product.stock) {
      return next(
        new AppError(
          `Insufficient stock for product "${product.name}". ` +
          `Requested: ${orderItem.quantity}, Available: ${product.stock}.`,
          400
        )
      );
    }

    totalPrice += orderItem.quantity * product.price;
    stockUpdates.push({ product, quantity: orderItem.quantity });


    resolvedItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: orderItem.quantity,
    });
  }

  for (const { product, quantity } of stockUpdates) {
    product.stock -= quantity;
    product.sold += quantity
    await product.save();
  }

  const order = await Order.create({
    user: userId,
    items: resolvedItems,
    shippingAddress,
    paymentMethod,
    notes,
    totalprice: (totalPrice + shipingCost),
  });

  sendOrderEmail(order, req.user.email)

  res.status(201).json({
    status: 'success',
    data: order,
  });
});

/**
 * @desc    Get my orders by Id
 * @route   GET http://localhost:3000/orders/my-orders/:id
 * @access  Confrimed User
 */
export const myOrders = catchAsync(async (req, res, next) => {
  const id = req.user.userId;

  const orders = await Order.find({ user: id }).lean();

  if (orders.length === 0) {
    return next(new AppError(`No orders found for user with ID: ${id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: orders,
  });
});

/**
 * @desc    Get single orders by Id
 * @route   Get http://localhost:3000/orders/:id
 * @access  Confrimed User/ Admin
 */

export const singelOrderById = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.userId

  const order = await Order.findById(id).lean();

  if (!order) {
    return next(new AppError(`No order found with ID: ${id}`, 404));
  }

  const orderUserId = order.user
  const role = req.user.role
  if (userId === orderUserId || role === "admin")//only if user is admin or if the order is attached to user 
  {
    return res.status(200).json({
      status: 'success',
      data: order,
    });

  } else {
    return next(new AppError(`Unauthorized`, 403));

  }


});

/**
 * @desc    Get all orders
 * @route   Get http://localhost:3000/orders
 * @access  Admin
 */
export const getAllOrders = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
  } = req.query


  // ── 3. PAGINATION ───────────────────────────────────────────────
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit))); // max 50 per page
  const skip = (pageNum - 1) * limitNum;

  const [order, totalOrders] = await Promise.all([

    Order.find()
      .sort({ createdAt: -1 })//newst first
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Order.countDocuments()
  ]);

  if (order.length === 0) {
    return next(new AppError(`No orders found`, 404));
  }

  const totalPages = Math.ceil(totalOrders / limitNum);

  res.status(200).json({
    status: 'success',
    results: order.length,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalOrders,
      limit: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    },
    data: order,
  });
});

/**
 * @desc    update status of order by Id
 * @route   Put http://localhost:3000/orders/:id/status
 * @access  Admin
 */
export const updateStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { orderStatus } = req.body;
  

  const order = await Order.findByIdAndUpdate(
    id,
    { orderStatus },
    { 
      returnDocument: 'after', // במקום new: true
      runValidators: true 
    }
  )
  .populate({
    path: 'user',
    select: 'email -_id'
  })
  .lean();

  if (!order) {
    return next(new AppError(`No orders found with ID: ${id}`, 404));
  }

  sendOrderStatusEmail(order.user.email, id ,orderStatus)

  res.status(200).json({
    status: 'success',
    data: order,
  });
});

/**
 * @desc    cancel order
 * @route   Put http://localhost:3000/orders/:id/cancel
 * @access  Admin
 */
export const cancelOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // finds the order ONLY if it exists AND is still pending
  const order = await Order.findOneAndUpdate(
    { _id: id, orderStatus: 'pending' },
    { orderStatus: 'cancelled' },
    { new: true, runValidators: true }
  );

  if (!order) {
    // either the order doesn't exist, or it's not in pending status
    const exists = await Order.exists({ _id: id });
    return next(new AppError(
      exists
        ? `Order ${id} cannot be cancelled because it is no longer pending.`
        : `No order found with ID: ${id}`,
      exists ? 400 : 404
    ));
  }

  res.status(200).json({
    status: 'success',
    data: order,
  });
});


