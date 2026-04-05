import mongoose, { Schema, Document, Types } from "mongoose";
// ─── Schemas ──────────────────────────────────────────────────
const addressSchema = new Schema({
    city: { type: String, required: true },
    street: { type: String, required: true },
    houseNumber: { type: Number, required: true },
    zip: { type: String, required: true },
});
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false,
    },
    image: {
        type: String,
    },
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: { type: String, default: null },
    verificationTokenExpiry: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpiry: { type: Date, default: null },
    twoFactorCode: { type: String, default: null },
    twoFactorExpiry: { type: Date, default: null },
    addresses: {
        type: [addressSchema],
        default: [],
    },
    cart: {
        type: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    min: 1,
                    required: true,
                },
            },
        ],
        default: [],
    },
}, { timestamps: true });
export default mongoose.model("User", userSchema);
//# sourceMappingURL=user.model.js.map