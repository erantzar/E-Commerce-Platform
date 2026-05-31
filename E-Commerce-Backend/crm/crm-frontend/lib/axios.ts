import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api/v1", // הכתובת של ה-Backend שלך
  headers: {
    "Content-Type": "application/json",
  },
});

// הוספת ה-Token לבקשות באופן אוטומטי אם הוא קיים
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

// 2. לוג אוטומטי לכל תגובה (Response) שחוזרת מהשרת ל-Frontend
apiClient.interceptors.response.use(
  (response) => {
    console.log(`%c[API Response] ✅ ${response.config.method?.toUpperCase()} <- ${response.config.url}`, "color: #4caf50; font-weight: bold;", {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // לוג במקרה של שגיאה (למשל 400, 401, 404, 500)
    console.error(`%c[API Error] ❌ ${error.config?.method?.toUpperCase()} <- ${error.config?.url}`, "color: #f44336; font-weight: bold;", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);
export default apiClient;