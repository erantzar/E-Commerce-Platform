import mongoose, { Document, Types } from "mongoose";
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
declare const Order: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, mongoose.DefaultSchemaOptions> & IOrder & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOrder>;
export default Order;
//# sourceMappingURL=order.model.d.ts.map