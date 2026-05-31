// shared/product.types.ts או lib/product.types.ts

export interface IProduct {
    _id?: string;
    name: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    stock: number;
    sold?: number;
    isActive?: boolean;
    averageRating?: number;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface ApiResponse<T> {
    status: string;
    data: T;
  }
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