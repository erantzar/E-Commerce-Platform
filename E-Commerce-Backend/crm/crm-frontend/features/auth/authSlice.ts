"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/lib/axios";

export const adminLogin = createAsyncThunk(
  "auth/adminLogin",
  async (userData: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await apiClient.post("/AuthRoutes/admin/login", userData);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "פרטי התחברות מנהל שגויים");
    }
  }
);

export const adminVerifyCode = createAsyncThunk(
  "auth/adminVerifyCode",
  async (verificationData: { userId: string; code: string }, thunkAPI) => {
    try {
      const response = await apiClient.post("/AuthRoutes/admin/verify-2fa", verificationData);
      const token = response.data?.data?.token || response.data?.token;
      
      if (token && typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("role", "admin");
      }
      
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "קוד אימות שגוי או פג תוקף");
    }
  }
);

interface AuthState {
  user: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(adminLogin.fulfilled, (state) => { state.isLoading = false; })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(adminVerifyCode.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(adminVerifyCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload?.data || action.payload;
      })
      .addCase(adminVerifyCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;