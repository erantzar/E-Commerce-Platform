import axios from "axios";

const apiClient = axios.create({
  // כאן את שמה את ה-baseUrl מה-Postman שלך (למשל localhost:5000/api/v1)
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;