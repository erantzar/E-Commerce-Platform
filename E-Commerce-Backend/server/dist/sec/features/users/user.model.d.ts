import mongoose, { Document, Types } from "mongoose";
export interface IAddress {
    city: string;
    street: string;
    houseNumber: number;
    zip: string;
}
export interface ICartItem {
    product: Types.ObjectId;
    quantity: number;
}
export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    image?: string;
    role: "customer" | "admin";
    isVerified: boolean;
    verificationToken?: string | null;
    verificationTokenExpiry?: Date | null;
    resetPasswordToken?: string | null;
    resetPasswordExpiry?: Date | null;
    twoFactorCode?: string | null;
    twoFactorExpiry?: Date | null;
    addresses: IAddress[];
    cart: ICartItem[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default _default;
//# sourceMappingURL=user.model.d.ts.map