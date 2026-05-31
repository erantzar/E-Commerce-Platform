import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/lib/axios";

// 1. הרשמה (Register)
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData: { name: string; email: string; password: string }, thunkAPI) => {
    try {
      const response = await apiClient.post("/AuthRoutes/register", userData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "ההרשמה נכשלה";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 2. התחברות (Login)
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await apiClient.post("/AuthRoutes/login", {
        email: userData.email,
        password: userData.password
      });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "פרטי התחברות שגויים";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 3. שכחתי סיסמה (Forgot Password)
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (userData: { email: string }, thunkAPI) => {
    try {
      const response = await apiClient.post("/AuthRoutes/password-forgot", {
        email: userData.email
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "שגיאה בשליחת בקשת השחזור";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 4. איפוס סיסמה (Reset Password)
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (userData: { id: string; password: string }, thunkAPI) => {
    try {
      // שימי לב איך אנחנו משרשרים את ה-id לנתיב כמו שהשרת מצפה: /password-reset/:id
      const response = await apiClient.post(`/AuthRoutes/password-reset/${userData.id}`, {
        password: userData.password
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "שגיאה באיפוס הסיסמה";
      return thunkAPI.rejectWithValue(message);
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
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state) => { state.isLoading = false; })
      .addCase(registerUser.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      
      // Login
      .addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => { state.isLoading = false; state.user = action.payload.user; })
      .addCase(loginUser.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(forgotPassword.fulfilled, (state) => { state.isLoading = false; })
      .addCase(forgotPassword.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(resetPassword.fulfilled, (state) => { state.isLoading = false; })
      .addCase(resetPassword.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;