import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1",
  withCredentials: true,
});
export interface IOrderItem {
  product: string;
  quantity: number;
}
export interface ICreateOrderPayload {
  addressId: string;
  paymentMethod: "credit" | "paypal" | "simulated";
  notes?: string;
  shipingCost: number;
  items: IOrderItem[];
}

// הוספת ה-Token לכל בקשה במידה והוא שמור ב-LocalStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const productService = {
  // ─── 📦 מוצרים (Products) ───
  getPublicProducts: async () => {
    try {
      const response = await apiClient.get("/products");
      
      // השרת שלך מחזיר מערך ישר לתוך response.data
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // לכל מקרה שהמבנה ישתנה בעתיד, נשמור על תמיכה במבנים אחרים
      return response.data?.data || response.data?.products || [];
    } catch (error) {
      console.error("שגיאה בקבלת מוצרים:", error);
      return []; // מחזיר מערך ריק כדי שהאתר לא יקרוס אם יש שגיאה
    }
  },

  // ─── 🔐 אימות משתמשים (Auth) ───
  registerUser: async (userData: any) => {
    const response = await apiClient.post("/AuthRoutes/register", userData);
    return response.data;
  },

  loginUser: async (credentials: any) => {
    const response = await apiClient.post("/AuthRoutes/login", credentials);
    if (response.data?.data) {
      localStorage.setItem("token", response.data.data); // שמירת הטוקן
    }
    return response.data;
  },

  logoutUser: async (userId: string) => {
    const response = await apiClient.put("/AuthRoutes/logout", { id: userId });
    localStorage.removeItem("token");
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post("/AuthRoutes/password-forgot", { email });
    return response.data;
  },

  resetPassword: async (token: string, password: any) => {
    const response = await apiClient.post(`/AuthRoutes/password-reset/${token}`, password);
    return response.data;
  },

  // ─── 👤 פרופיל משתמש ואזור אישי ───
  getUserProfile: async () => {
    const response = await apiClient.get("/users/profile");
    return response.data;
  },

  updateUserProfile: async (profileData: { name: string; email: string }) => {
    const response = await apiClient.put("/users/profile", profileData);
    return response.data;
  },

  changePassword: async (passwordData: { oldPassword: string; newPassword: string }) => {
    const response = await apiClient.put("/users/password-change", passwordData);
    return response.data;
  },

  // ─── 📍 ניהול כתובות המשתמש ───
  createAddress: async (addressData: { city: string; street: string; houseNumber: number; zip: string }) => {
    const response = await apiClient.post("/users/addresses", addressData);
    return response.data;
  },

  updateAddress: async (addrId: string, addressData: { city?: string; street?: string; houseNumber?: number; zip?: string }) => {
    const response = await apiClient.put(`/users/addresses/${addrId}`, addressData);
    return response.data;
  },

  deleteAddress: async (addrId: string) => {
    const response = await apiClient.delete(`/users/addresses/${addrId}`);
    return response.data;
  },

  // ─── 🛒 עגלת קניות (Cart) ───
  addToCart: async (productId: string, quantity: number) => {
    const response = await apiClient.post("/cart", { productId, quantity });
    return response.data;
  },

  updateCartItem: async (cartItemId: string, quantity: number) => {
    const response = await apiClient.put(`/cart/${cartItemId}`, { quantity });
    return response.data;
  },

  deleteCartItem: async (cartItemId: string) => {
    const response = await apiClient.delete(`/cart/${cartItemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await apiClient.delete("/cart");
    return response.data;
  },

  syncCart: async (guestCartItems: Array<{ product: string; quantity: number }>) => {
    const response = await apiClient.post("/cart/sync", guestCartItems);
    return response.data;
  },

  // ─── 📋 ניהול הזמנות (Orders) ───
  getAllOrders: async () => {
    const response = await apiClient.get("/orders");
    return response.data?.data?.orders || response.data?.orders || response.data || [];
  },

  getOrderById: async (orderId: string) => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data?.data || response.data;
  },

  cancelOrder: async (orderId: string) => {
    const response = await apiClient.put(`/orders/${orderId}/cancel`);
    return response.data;
  },

  // ─── 👑 ניהול אדמין (Admin Console) ───
  getAllUsers: async () => {
    const response = await apiClient.get("/users");
    return response.data?.data || response.data?.users || response.data || [];
  },

  updateUserRole: async (userId: string) => {
    const response = await apiClient.put(`/users/role/${userId}`);
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },
  createOrder: async (orderData: ICreateOrderPayload) => {
    // פנייה לראוט שהגדרת בשרת: /api/v1/orders
    const response = await apiClient.post("/orders", orderData);
    console.log(response.data);
    return response.data;
  }
};