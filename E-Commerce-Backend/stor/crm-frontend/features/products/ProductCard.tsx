"use client";

import React from "react";
import Link from "next/link";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    description?: string;
    price: number;
    images?: string[];
    image?: string;
    imageUrl?: string;
  };
  onAddToCart: (product: ProductCardProps["product"]) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const imageUrl = product.images?.[0] || product.image || product.imageUrl;

  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "15px",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
      }}
    >
      {/* לחיצה על התמונה/שם → דף המוצר */}
      <Link href={`/products/${product._id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <div
          style={{
            height: "140px",
            backgroundColor: "#edf2f7",
            borderRadius: "8px",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: "45px" }}>📦</span>
          )}
        </div>
        <h4 style={{ margin: "0 0 6px 0", color: "#2d3748" }}>{product.name}</h4>
        <p style={{ color: "#718096", fontSize: "13px", margin: "0 0 12px 0", height: "36px", overflow: "hidden" }}>
          {product.description || "אין תיאור זמין עבור מוצר זה"}
        </p>
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
        <span style={{ fontWeight: "bold", color: "#2b6cb0", fontSize: "16px" }}>{product.price} ₪</span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault(); // שלא יפתח את הלינק אם לחצו על הכפתור בתוך Link
            onAddToCart(product);
          }}
          style={{
            padding: "8px 14px",
            background: "#3182ce",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          הוסף לעגלה
        </button>
      </div>
    </div>
  );
}