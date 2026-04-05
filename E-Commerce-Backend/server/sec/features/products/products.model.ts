import mongoose, { Schema, Document, Types } from "mongoose";

// ─── Interfaces ───────────────────────────────────────────────

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

// ─── Schemas ──────────────────────────────────────────────────

const ratingSchema = new Schema<IRating>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Review must belong to a user"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, "Please provide a rating between 1 and 5"],
  },
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "A product must have a name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "A product must have a description"],
    },
    price: {
      type: Number,
      required: [true, "A product must have a price"],
      min: [0, "Price must be a positive number"],
    },
    category: {
      type: String,
      required: [true, "A product must have a category"],
      enum: {
        values: ["electronics", "clothing", "food", "home", "beauty"],
        message: "Category is either: electronics, clothing, food, home, or beauty",
      },
    },
    images: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: [true, "A product must have a stock quantity"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ratings: [ratingSchema],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (val: number) => Math.round(val * 10) / 10,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ createdAt: -1 }); // for default sort
productSchema.index({ price: 1 });      // for sort=price
productSchema.index({ category: 1 });   // for category filter

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;