type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
interface OrderItem {
    image: string;
    name: string;
    quantity: number;
    price: number;
}
interface ShippingAddress {
    street: string;
    houseNumber: string;
    city: string;
    zip: string;
}
interface Order {
    _id: string;
    orderStatus: OrderStatus;
    paymentMethod: string;
    paymentStatus: string;
    items: OrderItem[];
    shipingCost: number;
    totalprice: number;
    shippingAddress: ShippingAddress;
}
export declare const sendVerificationEmailHTML: (verificationLink: string) => string;
export declare const sendResetPasswordEmailHTML: (resetLink: string) => string;
export declare const sendTwoFactorEmailHTML: (twoFactorCode: string) => string;
export declare const sendOrderEmailHTML: (order: Order) => string;
export declare const sendOrderStatusEmailHTML: (orderId: string, orderStatus: string) => string;
export {};
//# sourceMappingURL=mailer.messeges.d.ts.map