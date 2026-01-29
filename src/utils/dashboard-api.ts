import { api } from "@/src/lib/api";
import { DashboardStats } from "../types";
import { ChartDataItem } from "@/data";


export const fetchDashboardStats = async (): Promise<DashboardStats | null> => {
  try {
    const response = await api.get('/api/dashboard/stats');
    const data = await response.json();
    
    if (data.success) {
      console.log(data.data);
      return data.data as DashboardStats;
    } else {
      alert(data.message || "Failed to fetch dashboard stats.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return null;
  }
};

export const fetchChartData = async (year: string): Promise<ChartDataItem[] | []> => {
  try {
    const response = await api.get(`/api/dashboard/chart?year=${year}`);
    const data = await response.json();
    
    if (data.success) {
      console.log(data.data);
      return data.data
    } else {
      alert(data.message || "Failed to fetch dashboard stats.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return [];
  }
};