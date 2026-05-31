"use client";

import React, { useState, useEffect } from "react";
import { productService } from "@/lib/productService";

interface IOrder {
  _id: string;
  paymentMethod: string;
  shipingCost: number;
  status: string; // 'pending' | 'cancelled' | 'completed' וכו'
  createdAt: string;
  items: Array<{ product: string; quantity: number; _id: string }>;
}

export default function OrdersTable() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // 1. טעינת כל ההזמנות מהשרת
  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await productService.getAllOrders();
      
      // לוג שיעזור לך לראות בדיוק מה חזר מהשרת בלשונית ה-Console
      console.log("=== תשובה גולמית מהשרת של ההזמנות ===", res);
  
      if (Array.isArray(res)) {
        setOrders(res);
      } else if (res && Array.isArray(res.data)) {
        // אם זה הגיע במבנה של { data: [...] }
        setOrders(res.data);
      } else if (res && Array.isArray(res.orders)) {
        // אם זה הגיע במבנה של { orders: [...] }
        setOrders(res.orders);
      } else {
        // במקרה חירום שהשרת שלח משהו מוזר, שלא יתרסק - שמי מערך ריק
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load orders", err);
      setMessage({ text: "שגיאה בטעינת רשימת ההזמנות מהשרת", isError: true });
      setOrders([]); // הגנה מפני התרסקות
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // 2. פונקציית ביטול הזמנה מהכפתור בטבלה
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm(`האם אתה בטוח שברצונך לבטל את הזמנה ${orderId}?`)) return;
    
    setActionLoading(orderId);
    setMessage(null);
    // שורה 61 המוגנת:
const filteredOrders = Array.isArray(orders) 
? orders.filter((order) => order?._id?.toLowerCase().includes(searchId.trim().toLowerCase()))
: [];
    try {
      await productService.cancelOrder(orderId);
      setMessage({ text: `הזמנה ${orderId} בוטלה בהצלחה!`, isError: false });
      // רענון הרשימה לאחר הביטול
      await loadOrders();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "נכשל בביטול ההזמנה";
      setMessage({ text: `שגיאה: ${errMsg}`, isError: true });
    } finally {
      setActionLoading(null);
    }
  };

  // 3. פונקציית חיפוש וסינון
  // אם שורת החיפוש ריקה - מציגים הכל. אם יש בה טקסט - מסננים לפי ה-ID
  const filteredOrders = orders.filter((order) =>
    order._id.toLowerCase().includes(searchId.trim().toLowerCase())
  );

  return (
    <div style={{ maxWidth: "800px", margin: "30px auto", padding: "20px", border: "1px solid #e2e8f0", borderRadius: "16px", backgroundColor: "#fff", direction: "rtl", fontFamily: "system-ui, sans-serif" }}>
      
      <h3 style={{ color: "#2d3748", marginBottom: "20px", borderBottom: "2px solid #edf2f7", paddingBottom: "8px" }}>ניהול ומעקב הזמנות במערכת</h3>

      {/* שורת חיפוש ארוכה */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#4a5568" }}>חפש הזמנה לפי מזהה (Order ID):</label>
        <input
          type="text"
          placeholder="הזן מזהה הזמנה לחיפוש מהיר..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #cbd5e0", fontSize: "14px", outline: "none", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)" }}
        />
      </div>

      {message && (
        <div style={{ marginBottom: "15px", padding: "10px", borderRadius: "6px", backgroundColor: message.isError ? "#fff5f5" : "#f0fff4", color: message.isError ? "#c53030" : "#22543d", border: message.isError ? "1px solid #feb2b2" : "1px solid #9ae6b4", textAlign: "center", fontSize: "14px", fontWeight: "500" }}>
          {message.text}
        </div>
      )}

      {/* טבלת ההזמנות */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "20px", color: "#718096" }}>🔄 טוען הזמנות מהשרת...</div>
      ) : filteredOrders.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "14px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f7fafc", borderBottom: "2px solid #edf2f7" }}>
                <th style={{ padding: "12px", color: "#4a5568" }}>מזהה הזמנה</th>
                <th style={{ padding: "12px", color: "#4a5568" }}>תאריך יצירה</th>
                <th style={{ padding: "12px", color: "#4a5568" }}>אמצעי תשלום</th>
                <th style={{ padding: "12px", color: "#4a5568", textAlign: "center" }}>סטטוס</th>
                <th style={{ padding: "12px", color: "#4a5568", textAlign: "left" }}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} style={{ borderBottom: "1px solid #edf2f7", transition: "background 0.2s" }}>
                  <td style={{ padding: "12px", fontFamily: "monospace", fontWeight: "600", color: "#2d3748" }}>{order._id}</td>
                  <td style={{ padding: "12px", color: "#718096" }}>{new Date(order.createdAt).toLocaleDateString("he-IL")}</td>
                  <td style={{ padding: "12px", color: "#4a5568" }}>{order.paymentMethod === "credit" ? "💳 אשראי" : order.paymentMethod}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{ padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", backgroundColor: order.status === "cancelled" ? "#fed7d7" : "#feebc8", color: order.status === "cancelled" ? "#9b2c2c" : "#c05621" }}>
                      {order.status || "pending"}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "left" }}>
                    {order.status !== "cancelled" ? (
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={actionLoading === order._id}
                        style={{ padding: "6px 12px", background: "#e53e3e", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600", transition: "background 0.2s" }}
                      >
                        {actionLoading === order._id ? "מבטל..." : "ביטול הזמנה"}
                      </button>
                    ) : (
                      <span style={{ color: "#a0aec0", fontSize: "12px", fontStyle: "italic" }}>מבוטלת</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "20px", color: "#a0aec0", backgroundColor: "#f7fafc", borderRadius: "8px" }}>
          🔍 לא נמצאו הזמנות התואמות את החיפוש.
        </div>
      )}
    </div>
  );
}