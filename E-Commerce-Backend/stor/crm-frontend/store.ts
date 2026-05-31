import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // כאן נחבר בהמשך את שאר הפיצ'רים של החנות (עגלת קניות, מוצרים)
  },
});

// הגדרת טיפוסים (Types) עבור TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;