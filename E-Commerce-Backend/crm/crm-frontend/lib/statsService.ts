import apiClient from "./axios";
import { DashboardStatsData } from "@/shared/stats.types";

export const statsService = {
  getDashboardStats: async (): Promise<DashboardStatsData> => {
    const response = await apiClient.get("/stats/dashboard");
    return response.data.data;
  },
};