"use client";

import React from "react";

interface CartItem {
  product: { _id: string; name: string; price: number; image?: string } | string;
  productId?: string;
  quantity: number;
  _id?: string; // ה-ID של השורה בעגלת השרת
}

interface CartSidebarProps {
  cartItems: CartItem[];
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onCheckout: () => void;
}

export default function CartSidebar({ cartItems, onUpdateQty, onRemove, onClear, onCheckout }: CartSidebarProps) {
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = typeof item.product === "object" ? item.product.price : 0;
      return total + price * item.quantity;
    }, 0);
  };

  return (
    <div style={{ width: "350px", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", backgroundColor: "#fff", direction: "rtl", fontFamily: "system-ui" }}>
      <h3 style={{ borderBottom: "2px solid #edf2f7", paddingBottom: "8px", margin: "0 0 15px 0" }}>🛒 עגלת הקניות שלי</h3>
      
      {cartItems.length === 0 ? (
        <p style={{ color: "#a0aec0", fontStyle: "italic", textAlign: "center" }}>העגלה ריקה כרגע</p>
      ) : (
        <>
          <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "15px" }}>
            {cartItems.map((item, idx) => {
              const prod = typeof item.product === "object" ? item.product : { name: "מוצר", price: 0, _id: item.product };
              const itemId = item._id || prod._id;

              return (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #edf2f7" }}>
                  <div>
                    <div style={{ fontWeight: "600" }}>{prod.name}</div>
                    <div style={{ fontSize: "13px", color: "#718096" }}>{prod.price} ₪</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button onClick={() => onUpdateQty(itemId, item.quantity - 1)} disabled={item.quantity <= 1} style={{ padding: "2px 8px", cursor: "pointer" }}>-</button>
                    <span style={{ fontWeight: "bold" }}>{item.quantity}</span>
                    <button onClick={() => onUpdateQty(itemId, item.quantity + 1)} style={{ padding: "2px 8px", cursor: "pointer" }}>+</button>
                    <button onClick={() => onRemove(itemId)} style={{ marginRight: "10px", color: "#e53e3e", border: "none", background: "none", cursor: "pointer" }}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: "2px solid #edf2f7", paddingTop: "10px", marginBottom: "15px", display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
            <span>סה"כ לתשלום:</span>
            <span>{calculateTotal()} ₪</span>
          </div>

          <button onClick={onCheckout} style={{ width: "100%", padding: "12px", background: "#3182ce", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", marginBottom: "8px" }}>💳 מעבר לתשלום (הזמנה)</button>
          <button onClick={onClear} style={{ width: "100%", padding: "8px", background: "#edf2f7", color: "#4a5568", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>רוקן עגלה</button>
        </>
      )}
    </div>
  );
}