import mongoose, { Schema, Document, Types } from "mongoose";

// ─── Interfaces ───────────────────────────────────────────────

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

export interface IShippingAddress {
  city: string;
  street: string;
  houseNumber: number;
  zip: string;
}

export type PaymentMethod = "credit" | "paypal" | "simulated";
export type PaymentStatus = "paid" | "pending" | "failed";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface IOrder extends Document {
  user: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  totalprice: number;
  shipingCost: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schemas ──────────────────────────────────────────────────

const orderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },

    items: [orderItemSchema],

    shippingAddress: {
      city:        { type: String, required: true },
      street:      { type: String, required: true },
      houseNumber: { type: Number, required: true },
      zip:         { type: String, required: true },
    },

    totalprice: {
      type: Number,
      required: true,
    },

    shipingCost: {
      type: Number,
      default: 0,
    },

    paymentMethod: {
      type: String,
      required: true,
      enum: {
        values: ["credit", "paypal", "simulated"],
      },
    },

    paymentStatus: {
      type: String,
      enum: {
        values: ["paid", "pending", "failed"],
        message: "Payment status is either: paid, pending or failed",
      },
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: {
        values: ["pending", "processing", "shipped", "delivered", "cancelled"],
        message: "orderStatus is either: pending, processing, shipped, delivered or cancelled",
      },
      default: "pending",
    },

    trackingNumber: String,
    notes: String,
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", orderSchema);
export default Order;