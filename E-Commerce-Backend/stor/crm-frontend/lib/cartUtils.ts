import { apiClient } from "@/lib/productService"; // או apiClient מ-lib/axios

export async function enrichCartItems(cartItems: any[]) {
  if (!cartItems?.length) return [];

  return Promise.all(
    cartItems.map(async (item) => {
      const productId =
        typeof item.product === "string" ? item.product : item.product?._id;

      if (!productId) return item;

      // אם כבר יש אובייקט מלא עם name — לא צריך לשלוף שוב
      if (typeof item.product === "object" && item.product?.name) {
        return item;
      }

      try {
        const res = await apiClient.get(`/products/${productId}`);
        const fullProduct = res.data?.data ?? res.data;
        return { ...item, product: fullProduct };
      } catch {
        return item;
      }
    })
  );
}