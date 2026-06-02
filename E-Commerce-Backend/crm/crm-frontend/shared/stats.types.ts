export interface DashboardSummary {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    lowStockCount: number;
  }
  
  export interface TopSellingProduct {
    _id: string;
    name: string;
    sold: number;
    stock: number;
    price: number;
    images?: string[];
  }
  
  export interface TopOrderedItem {
    _id: string;
    name: string;
    totalQuantity: number;
    revenue: number;
  }
  
  export interface LowStockProduct {
    _id: string;
    name: string;
    stock: number;
    sold: number;
  }
  
  export interface DashboardStatsData {
    summary: DashboardSummary;
    topSellingBySold: TopSellingProduct[];
    topOrderedFromOrders: TopOrderedItem[];
    lowStockProducts: LowStockProduct[];
  }