// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice"; // או איפה שה-authSlice שלך יושב
import productReducer from "@/features/products/productSlice"; // ◄ 1. ייבוא של ה-reducer החדש!

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer, // ◄ 2. חיבור הפיצ'ר ל-Store המרכזי תחת השם products
  },
});

// הגדרת הטיפוסים הכלליים של ה-Store (כדי ש-useSelector יכיר את המבנה החדש)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;