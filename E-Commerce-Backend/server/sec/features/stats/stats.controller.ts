import type { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../../shared/middleware/catchAsync.js";
import Product from "../products/products.model.js";
import Order from "../orders/order.model.js";

const LOW_STOCK_THRESHOLD = 5;

/**
 * @desc    Dashboard stats for store (admin)
 * @route   GET /stats/dashboard
 * @access  Admin
 */
export const getDashboardStats = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const notCancelled = { orderStatus: { $ne: "cancelled" } };

    const [
      topSellingBySold,
      lowStockProducts,
      topOrderedFromOrders,
      totalOrders,
      pendingOrders,
      revenueAgg,
      lowStockCount,
    ] = await Promise.all([
      Product.find()
        .sort({ sold: -1 })
        .limit(5)
        .select("name sold stock price images")
        .lean(),

      Product.find({ stock: { $lte: LOW_STOCK_THRESHOLD } })
        .sort({ stock: 1 })
        .select("name stock sold")
        .lean(),

      Order.aggregate([
        { $match: notCancelled },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            name: { $first: "$items.name" },
            totalQuantity: { $sum: "$items.quantity" },
            revenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
      ]),

      Order.countDocuments(notCancelled),
      Order.countDocuments({ orderStatus: "pending" }),
      Order.aggregate([
        { $match: notCancelled },
        { $group: { _id: null, total: { $sum: "$totalprice" } } },
      ]),
      Product.countDocuments({ stock: { $lte: LOW_STOCK_THRESHOLD } }),
    ]);

    const totalRevenue = revenueAgg[0]?.total ?? 0;

    res.status(200).json({
      status: "success",
      data: {
        summary: {
          totalRevenue,
          totalOrders,
          pendingOrders,
          lowStockCount,
        },
        topSellingBySold,
        topOrderedFromOrders,
        lowStockProducts,
      },
    });
  }
);