// features/products/productSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productService } from "@/lib/productService";
import { IProduct } from "@/shared/product.types";

export interface ProductState {
  products: IProduct[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  isLoading: false,
  error: null,
};

// --- תהליכים אסינכרוניים (Thunks) ---

// הבאת כל המוצרים
export const fetchProducts = createAsyncThunk("products/fetchAll", async (_, thunkAPI) => {
  try {
    return await productService.getAllProducts();
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "נכשל בטעינת מוצרים");
  }
});

// הוספת מוצר חדש (POST)
export const addProduct = createAsyncThunk("products/add", async (productData: Partial<IProduct>, thunkAPI) => {
  try {
    return await productService.createProduct(productData as IProduct);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "יצירת מוצר נכשלה");
  }
});

// עדכון מוצר (PUT)
export const updateProductAction = createAsyncThunk(
  "products/update",
  async ({ id, updateData }: { id: string; updateData: Partial<IProduct> }, thunkAPI) => {
    try {
      return await productService.updateProduct(id, updateData);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "עדכון המוצר נכשל");
    }
  }
);

// מחיקת מוצר (DELETE)
export const removeProduct = createAsyncThunk("products/remove", async (id: string, thunkAPI) => {
  try {
    await productService.deleteProduct(id);
    return id; // מחזירים את ה-ID כדי להסיר מהסטייט המקומי
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "מחיקת מוצר נכשלה");
  }
});

// --- ה-Slice ---
export const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProductError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchProducts.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => { state.isLoading = false; state.products = action.payload; })
      .addCase(fetchProducts.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      
      // Add
      .addCase(addProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      
      // Update
      .addCase(updateProductAction.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload; // מעדכן את המוצר ברשימה בזמן אמת
        }
      })
      
      // Remove
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p._id !== action.payload);
      });
  },
});

export const { clearProductError } = productSlice.actions;
export default productSlice.reducer;