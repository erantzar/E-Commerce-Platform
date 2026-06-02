"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { productService } from "@/lib/productService";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedMsg, setAddedMsg] = useState("");

  useEffect(() => {
    if (!id) return;

    const loadProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await productService.getProductById(id);
        if (!data || !data._id) {
          setError("המוצר לא נמצא");
          setProduct(null);
        } else {
          setProduct(data);
        }
      } catch (err) {
        console.error(err);
        setError("שגיאה בטעינת המוצר");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    const token = localStorage.getItem("token");
    const isLoggedIn = !!token;

    if (isLoggedIn) {
      try {
        await productService.addToCart(product._id, quantity);
        setAddedMsg("נוסף לעגלה!");
      } catch {
        setAddedMsg("שגיאה בהוספה לעגלה");
      }
      return;
    }

    // אורח — אותה לוגיקה כמו בדף הבית
    const localCart = localStorage.getItem("guest_cart");
    const cart = localCart ? JSON.parse(localCart) : [];
    const existing = cart.find(
      (item: any) =>
        (typeof item.product === "object" ? item.product._id : item.product) === product._id
    );
    if (existing) existing.quantity += quantity;
    else cart.push({ product, quantity });
    localStorage.setItem("guest_cart", JSON.stringify(cart));
    setAddedMsg("נוסף לעגלה!");
  };

  if (loading) {
    return <p style={{ textAlign: "center", padding: "40px" }}>טוען מוצר...</p>;
  }

  if (error || !product) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p>{error || "המוצר לא נמצא"}</p>
        <Link href="/" style={{ color: "#3182ce" }}>חזרה לחנות</Link>
      </div>
    );
  }

  const imageUrl = product.images?.[0] || product.image || product.imageUrl;

  return (
    <div style={{ maxWidth: "900px", margin: "30px auto", padding: "0 20px", direction: "rtl" }}>
      <button
        type="button"
        onClick={() => router.back()}
        style={{ marginBottom: "20px", background: "none", border: "none", color: "#3182ce", cursor: "pointer" }}
      >
        ← חזרה
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
        {/* תמונה */}
        <div
          style={{
            height: "320px",
            backgroundColor: "#edf2f7",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: "64px" }}>📦</span>
          )}
        </div>

        {/* פרטים */}
        <div>
          <h1 style={{ margin: "0 0 10px 0", color: "#2d3748" }}>{product.name}</h1>
          <p style={{ color: "#718096", marginBottom: "16px" }}>{product.category}</p>
          <p style={{ fontSize: "28px", fontWeight: "bold", color: "#2b6cb0", marginBottom: "16px" }}>
            ₪{product.price?.toLocaleString()}
          </p>
          <p style={{ lineHeight: 1.6, color: "#4a5568", marginBottom: "20px" }}>
            {product.description || "אין תיאור"}
          </p>
          <p style={{ marginBottom: "12px" }}>
            מלאי: <strong>{product.stock ?? 0}</strong>
          </p>
          {product.averageRating > 0 && (
            <p style={{ marginBottom: "16px" }}>⭐ {product.averageRating}</p>
          )}

          {/* כמות */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span>כמות:</span>
            <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
            <span>{quantity}</span>
            <button type="button" onClick={() => setQuantity((q) => q + 1)}>+</button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            style={{
              padding: "12px 24px",
              background: product.stock === 0 ? "#a0aec0" : "#3182ce",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: product.stock === 0 ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}
          >
            {product.stock === 0 ? "אזל מהמלאי" : "הוסף לעגלה"}
          </button>

          {addedMsg && <p style={{ color: "#38a169", marginTop: "10px" }}>{addedMsg}</p>}
        </div>
      </div>
    </div>
  );
}