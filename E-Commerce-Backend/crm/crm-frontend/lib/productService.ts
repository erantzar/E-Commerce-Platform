// lib/productService.ts
import apiClient from "./axios"; 
import { IProduct,ICreateOrderPayload } from "../shared/product.types"; 

export const productService = {
  
  // 1. GET /products - הבאת כל המוצרים
  getAllProducts: async (): Promise<IProduct[]> => {
    const response = await apiClient.get("/products");
    console.log("=== תשובה גולמית מה-API של המוצרים ===", response.data);
    // בודק אם השרת החזיר את המערך ישירות או בתוך עטיפה של data
    
    return response.data?.data?.products || response.data?.products || [];
  },

  // 2. GET /products/:id - הבאת מוצר בודד לפי ה-ID
  getProductById: async (productId: string): Promise<IProduct> => {
    const response = await apiClient.get(`/products/${productId}`);
    return response.data?.data || response.data;
  },

  // 3. POST /products - יצירת מוצר חדש
  createProduct: async (productData: IProduct): Promise<IProduct> => {
    const response = await apiClient.post("/products", productData);
    return response.data?.data || response.data;
  },

  // 4. PUT /products/:id - עדכון מוצר קיים
  updateProduct: async (productId: string, updateData: Partial<IProduct>): Promise<IProduct> => {
    const response = await apiClient.put(`/products/${productId}`, updateData);
    return response.data?.data || response.data;
  },

  // 5. DELETE /products/:id - מחיקת מוצר
  deleteProduct: async (productId: string): Promise<{ status: string; message?: string }> => {
    const response = await apiClient.delete(`/products/${productId}`);
    return response.data;
  },
  // הגדרת הטיפוסים (Types) לפי ה-Schema וה-JSON שלך

  // פונקציה ליצירת הזמנה חדשה
  createOrder: async (orderData: ICreateOrderPayload) => {
    // פנייה לראוט שהגדרת בשרת: /api/v1/orders
    const response = await apiClient.post("/orders", orderData);
    console.log(response.data);
    return response.data;
  },
  // הבאת כל ההזמנות - GET /orders
  getAllOrders: async () => {
    const response = await apiClient.get("/orders");
    return response.data?.data?.orders || response.data?.orders || response.data || [];
  },

  // חיפוש הזמנה ספציפית לפי ID - GET /orders/:id
  getOrderById: async (orderId: string) => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data?.data || response.data;
  },

  // ביטול הזמנה - PATCH/PUT /orders/:id/cancel (בהתאם ל-HTTP Method בשרת שלך, נשתמש ב-put/patch)
  cancelOrder: async (orderId: string) => {
    const response = await apiClient.put(`/orders/${orderId}/cancel`);
    return response.data;
  },
  // ─── פרופיל משתמש ───

  // 1. הבאת פרופיל המשתמש - GET /users/profile
  getUserProfile: async () => {
    const response = await apiClient.get("/users/profile");
    return response.data;
  },

  // 2. עדכון פרטי פרופיל (שם ואימייל) - PUT /users/profile
  updateUserProfile: async (profileData: { name: string; email: string }) => {
    const response = await apiClient.put("/users/profile", profileData);
    return response.data;
  },

  // 3. שינוי סיסמה - PUT /users/password-change
  changePassword: async (passwordData: { oldPassword: string; newPassword: string }) => {
    const response = await apiClient.put("/users/password-change", passwordData);
    return response.data;
  },

  // ─── ניהול כתובות המשתמש ───

  // 4. יצירת כתובת חדשה - POST /users/addresses
  createAddress: async (addressData: { city: string; street: string; houseNumber: number; zip: string }) => {
    const response = await apiClient.post("/users/addresses", addressData);
    return response.data;
  },

  // 5. עדכון כתובת קיימת - PUT /users/addresses/:addrId
  updateAddress: async (addrId: string, addressData: { city?: string; street?: string; houseNumber?: number; zip?: string }) => {
    const response = await apiClient.put(`/users/addresses/${addrId}`, addressData);
    return response.data;
  },

  // 6. מחיקת כתובת - DELETE /users/addresses/:addrId
  deleteAddress: async (addrId: string) => {
    const response = await apiClient.delete(`/users/addresses/${addrId}`);
    return response.data;
  },
  // ─── ניהול משתמשים (Admin) ───

  // 1. הבאת כל המשתמשים במערכת - GET /users
  getAllUsers: async () => {
    const response = await apiClient.get("/users");
    // מחזיר את המערך מתוך הריספונס בהתאם למבנה של השרת שלך
    return response.data?.data || response.data?.users || response.data || [];
  },

  // 2. עדכון תפקיד משתמש (רגיל <-> אדמין) - PUT /users/role/:id
  // השרת מקבל רק מזהה ב-params ומחליף את הרול (או מחליף אוטומטית או לפי body, נבצע קריאה לפי ה-params)
  updateUserRole: async (userId: string) => {
    const response = await apiClient.put(`/users/role/${userId}`);
    return response.data;
  },

  // 3. מחיקת משתמש מהמערכת - DELETE /users/:id
  deleteUser: async (userId: string) => {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  }

};