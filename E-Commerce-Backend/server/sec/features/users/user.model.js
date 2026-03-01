import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({

  // שם מלא
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },

  // אימייל ייחודי
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  // סיסמה מוצפנת
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },

  // הרשאות
  role: {
    type: String,
    enum: ["customer", "admin"],
    default: "customer"
  },

  // אימות אימייל
  isVerified: {
    type: Boolean,
    default: false
  },

  verificationToken: String,
  verificationTokenExpiry: Date,

  // איפוס סיסמה
  resetPasswordToken: String,
  resetPasswordExpiry: Date,

  // 2FA
  twoFactorCode: String,
  twoFactorExpiry: Date,

  // כתובות (פשוט כ-array של אובייקטים)
  addresses: {
    type: [
      {
        city: String,
        street: String,
        houseNumber: Number,
        zip: String
      }
    ],
    default: []
  },

  // עגלת קניות
  cart: {
    type: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        quantity: {
          type: Number,
          min: 1
        }
      }
    ],
    default: []
  }

}, { timestamps: true });

/* הצפנת סיסמה לפני שמירה */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", userSchema);