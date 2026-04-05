import mongoose, { Document, Types } from "mongoose";
export type ProductCategory = "electronics" | "clothing" | "food" | "home" | "beauty";
export interface IRating {
    user: Types.ObjectId;
    rating: number;
    comment?: string;
    createdAt?: Date;
}
export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    category: ProductCategory;
    images: string[];
    stock: number;
    sold: number;
    isActive: boolean;
    ratings: IRating[];
    averageRating: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const Product: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, mongoose.DefaultSchemaOptions> & IProduct & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProduct>;
export default Product;
//# sourceMappingURL=products.model.d.ts.map