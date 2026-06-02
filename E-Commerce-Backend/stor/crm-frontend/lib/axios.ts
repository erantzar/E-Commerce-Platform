import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api/v1", // הכתובת של ה-Backend שלך
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. הוספת ה-Token לבקשות באופן אוטומטי אם הוא קיים (עם הגנה ל-Next.js)
apiClient.interceptors.request.use((config) => {
  // הבדיקה הזו מוודא שהקוד רץ בדפדפן ולא קורס בשרת של Next.js
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 2. לוג אוטומטי ב-Console לכל בקשה (Request) שיוצאת מהאתר לשרת
apiClient.interceptors.request.use(
  (config) => {
    console.log(`%c[API Request] 🚀 ${config.method?.toUpperCase()} -> ${config.url}`, "color: #00bcd4; font-weight: bold;", {
      data: config.data,
      params: config.params
    });
    return config;
  },
  (error) => {
    console.error("[API Request Error] ❌", error);
    return Promise.reject(error);
  }
);

// 3. לוג אוטומטי ב-Console לכל תגובה (Response) שחוזרת מהשרת לפרונטאנד
apiClient.interceptors.response.use(
  (response) => {
    console.log(`%c[API Response] ✅ ${response.config.method?.toUpperCase()} <- ${response.config.url}`, "color: #4caf50; font-weight: bold;", {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // לוג מפורט וצבעוני במקרה של שגיאה (למשל 400, 401, 500)
    console.error(`%c[API Error] ❌ ${error.config?.method?.toUpperCase()} <- ${error.config?.url}`, "color: #f44336; font-weight: bold;", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default apiClient;