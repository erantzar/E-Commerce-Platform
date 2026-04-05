import { catchAsync } from "../../../shared/middleware/catchAsync.js";
import AppError from "../../../shared/utils/appError.js";
import Product from "../products/products.model.js";
import User from "../users/user.model.js";
import { sendOrderEmail, sendOrderStatusEmail } from "../../utils/mailer.js";
import Order from "./order.model.js";
/**
 * @desc    Create a new Order
 * @route   POST /orders/
 * @access  Confirmed User
 */
export const createOrder = catchAsync(async (req, res, next) => {
    const { items, addressId, paymentMethod, notes, shipingCost } = req.body;
    const { id } = req.user;
    const user = await User.findById(id);
    if (!user)
        throw new Error("User not found");
    const email = user.email;
    const address = user.addresses.id(addressId);
    if (!address)
        throw new Error("Address not found");
    const shippingAddress = {
        city: address.city,
        street: address.street,
        houseNumber: address.houseNumber,
        zip: address.zip,
    };
    if (!items || items.length === 0) {
        return next(new AppError("An order must contain at least one item.", 400));
    }
    const stockUpdates = [];
    const resolvedItems = []; // שינוי ל-any[] פותר את שגיאת ה-Overload ב-create
    let totalPrice = 0;
    for (const orderItem of items) {
        const product = await Product.findById(orderItem.product).select("stock price name images isActive sold");
        if (!product) {
            return next(new AppError(`Product with ID ${orderItem.product} was not found.`, 404));
        }
        if (!product.isActive) {
            return next(new AppError(`Product ${product.name} is inactive`, 400));
        }
        if (orderItem.quantity > product.stock) {
            return next(new AppError(`Insufficient stock for product "${product.name}".`, 400));
        }
        totalPrice += orderItem.quantity * product.price;
        stockUpdates.push({ product, quantity: orderItem.quantity });
        resolvedItems.push({
            product: product._id,
            name: product.name,
            price: product.price,
            image: product.images[0] || "",
            quantity: orderItem.quantity,
        });
    }
    // עדכון המלאי
    for (const { product, quantity } of stockUpdates) {
        product.stock -= quantity;
        product.sold += (product.sold || 0) + quantity;
        await product.save();
    }
    // יצירת ההזמנה - הוספת 'as any' כדי למנוע את שגיאת ה-Overload
    const order = await Order.create({
        user: id,
        items: resolvedItems,
        shippingAddress,
        paymentMethod,
        notes,
        totalprice: totalPrice + shipingCost,
    });
    // שליחת המייל - וודאי שהפונקציה ב-Mailer מקבלת (email, order)
    // והוסיפי await אם היא מחזירה Promise
    console.log("זה נכון", order, "זה נכון");
    await sendOrderEmail(order, email);
    res.status(201).json({
        status: "success",
        data: order,
    });
});
/**
 * @desc    Get my orders
 * @route   GET /orders/my-orders
 * @access  Confirmed User
 */
export const myOrders = catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const orders = await Order.find({ user: id }).lean();
    if (orders.length === 0) {
        return next(new AppError(`No orders found for user with ID: ${id}`, 404));
    }
    res.status(200).json({
        status: "success",
        results: orders.length,
        data: orders,
    });
});
/**
 * @desc    Get single order by Id
 * @route   GET /orders/:id
 * @access  Confirmed User / Admin
 */
export const singelOrderById = catchAsync(async (req, res, next) => {
    const { idOrde } = req.params;
    const { id } = req.user;
    const order = await Order.findById(idOrde).lean();
    if (!order) {
        return next(new AppError(`No order found with ID: ${idOrde}`, 404));
    }
    const user = await User.findById(id);
    if (!user) {
        return next(new AppError(`No order found with ID: ${id}`, 404));
    }
    const role = user.role;
    const orderUserId = String(order.user);
    if (id === orderUserId || role === "admin") {
        return res.status(200).json({
            status: "success",
            data: order,
        });
    }
    else {
        return next(new AppError("Unauthorized", 403));
    }
});
/**
 * @desc    Get all orders
 * @route   GET /orders
 * @access  Admin
 */
export const getAllOrders = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;
    const [orders, totalOrders] = await Promise.all([
        Order.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Order.countDocuments(),
    ]);
    if (orders.length === 0) {
        return next(new AppError("No orders found", 404));
    }
    const totalPages = Math.ceil(totalOrders / limitNum);
    res.status(200).json({
        status: "success",
        results: orders.length,
        pagination: {
            currentPage: pageNum,
            totalPages,
            totalOrders,
            limit: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
        },
        data: orders,
    });
});
/**
 * @desc    Update status of order by Id
 * @route   PUT /orders/:id/status
 * @access  Admin
 */
export const updateStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { orderStatus } = req.body;
    const order = await Order.findByIdAndUpdate(id, { orderStatus }, { returnDocument: "after", runValidators: true })
        .populate({ path: "user", select: "email -_id" })
        .lean();
    if (!order) {
        return next(new AppError(`No orders found with ID: ${id}`, 404));
    }
    // שימוש באימייל של המשתמש המחובר ששלח את הבקשה
    // שליפת האימייל של הלקוח מתוך ההזמנה המעודכנת
    const customerEmail = order.user?.email;
    if (customerEmail) {
        // שליחת המייל ללקוח ולא לאדמין שמעדכן
        await sendOrderEmail(order, customerEmail);
    }
    res.status(200).json({
        status: "success",
        data: order,
    });
});
/**
 * @desc    Cancel order
 * @route   PUT /orders/:id/cancel
 * @access  Admin
 */
export const cancelOrder = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
        return next(new AppError(`No order found with ID: ${id}`, 404));
    }
    if (order.orderStatus !== "pending") {
        return next(new AppError(`Order ${id} cannot be cancelled because it is ${order.orderStatus}.`, 400));
    }
    order.orderStatus = "cancelled";
    await order.save();
    res.status(200).json({
        status: "success",
        data: order,
    });
});
//# sourceMappingURL=order.controller.js.map