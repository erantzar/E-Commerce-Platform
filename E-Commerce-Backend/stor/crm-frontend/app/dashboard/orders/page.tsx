"use client";

import React, { useState, useEffect } from "react";
import { productService } from "@/lib/productService"; 
import { ICreateOrderPayload, } from "@/lib/productService";
import OrdersTable from "@/features/orders/OrdersTable"; // ייבוא הטבלה החדשה
import apiClient from "@/lib/axios"; // ייבוא ה-axios שלך כדי לשלוף את הפרופיל

// הגדרת המבנה של הפרופיל שמתקבל מה-API שלך
interface IUserProfile {
  _id: string;
  name: string;
  email: string;
  addresses: Array<{
    city: string;
    street: string;
    houseNumber: number;
    zip: string;
    _id: string;
  }>;
  cart: Array<{
    product: string | any; // מזהה המוצר או אובייקט מוצר מלא אם עשיתם populate
    quantity: number;
    _id: string;
  }>;
}

export default function OrderForm() {
  // 1. סטייט לפרופיל הלקוח והטעינה
  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
  const [fetchingUser, setFetchingUser] = useState(true);

  // 2. סטייט לשדות הניתנים לבחירה בטופס
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "paypal" | "simulated">("credit");
  const [notes, setNotes] = useState("נא להשאיר ליד הדלת בבקשה");
  const [shipingCost] = useState(15); 

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // 3. שליפת פרופיל המשתמש בטעינת העמוד (useEffect)
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await apiClient.get("/users/profile");
        const userData = response.data?.data;
        
        if (userData) {
          setUserProfile(userData);
          // בחירת הכתובת הראשונה כברירת מחדל אם קיימות כתובות
          if (userData.addresses && userData.addresses.length > 0) {
            setSelectedAddressId(userData.addresses[0]._id);
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch profile", err);
        setMessage({ text: "שגיאה בטעינת נתוני המשתמש והעגלה. ודא שאתה מחובר.", isError: true });
      } finally {
        setFetchingUser(false);
      }
    };

    fetchUserProfile();
  }, []);

  // 4. שליחת הטופס ויצירת ההזמנה בשרת
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile || !userProfile.cart || userProfile.cart.length === 0) {
      setMessage({ text: "העגלה שלך ריקה בשרת, אין מוצרים להזמנה", isError: true });
      return;
    }
  
    setLoading(true);
    setMessage(null);
  
    // 1. בניית מערך ה-items בדיוק במבנה המקורי: product ו-quantity
    const formattedItems = userProfile.cart.map(item => {
      // מוודא שאנחנו שולחים רק את הסטרינג של ה-ID של המוצר מהעגלה האמיתית
      const productId = typeof item.product === "object" ? item.product?._id : item.product;
      return {
        product: productId, // ◄ חזרנו ל-"product" בדיוק כמו שביקשת!
        quantity: item.quantity
      };
    });
  
    // 2. בניית האובייקט המדויק ב-100% לפי ה-JSON הנדרש
    const payload = {
      addressId: selectedAddressId, // ה-_id של הכתובת שנבחרה מהדרופדאון
      paymentMethod: paymentMethod, // "credit" / "paypal" / "simulated"
      notes: notes,
      shipingCost: shipingCost, // 15 (עם p אחת כמו בשרת)
      items: formattedItems
    };
  
    // הדפסה ב-Console של הדפדפן כדי שתוכלי לראות שהמבנה יוצא מושלם
    console.log("=== ה-Payload שנשלח לשרת ===", JSON.stringify(payload, null, 2));
  
    try {
      const response = await productService.createOrder(payload as any);
      
      if (response.status === "success" || response.status === 200 || response._id) {
        setMessage({ text: `🚀 ההזמנה נוצרה בהצלחה! מזהה הזמנה: ${response.data?._id || response._id}`, isError: false });
      }
    } catch (error: any) {
      // תפיסת שגיאות ממוקדת כדי להבין מה השרת לא אוהב
      const serverMessage = error.response?.data?.message || error.response?.data?.data?.[0]?.message || "שגיאה בנתוני ההזמנה";
      setMessage({ text: `❌ שגיאה 400 מהשרת: ${serverMessage}`, isError: true });
      console.error("Server Error Response:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingUser) {
    return <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "sans-serif" }}>🔄 טוען נתוני פרופיל ועגלה מהשרת...</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "30px", border: "1px solid #e2e8f0", borderRadius: "16px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", direction: "rtl", fontFamily: "system-ui, sans-serif", backgroundColor: "#fff" }}>
      
      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        <h2 style={{ margin: "0 0 5px 0", color: "#1a202c", fontWeight: "700" }}>קופה (Checkout)</h2>
        <p style={{ color: "#718096", margin: 0 }}>שלום, <strong>{userProfile?.name}</strong> ({userProfile?.email})</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        
        {/* ─── חלק א': טבלת מוצרים דינמית מתוך ה-cart של המשתמש ─── */}
        <h3 style={{ borderBottom: "2px solid #edf2f7", paddingBottom: "8px", color: "#4a5568", marginBottom: "15px" }}>1. פריטים בעגלה שלך</h3>
        
        {userProfile && userProfile.cart.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "25px", textAlign: "right" }}>
            <thead>
              <tr style={{ backgroundColor: "#f7fafc", borderBottom: "2px solid #edf2f7" }}>
                <th style={{ padding: "12px", color: "#718096" }}>מזהה מוצר</th>
                <th style={{ padding: "12px", color: "#718096", textAlign: "center" }}>כמות</th>
              </tr>
            </thead>
            <tbody>
              {userProfile.cart.map((item) => (
                <tr key={item._id} style={{ borderBottom: "1px solid #edf2f7" }}>
                  {/* מציג את ה-ID (או השם במידה ועשיתם populate בשרת) */}
                  <td style={{ padding: "12px", color: "#2d3748", fontFamily: "monospace" }}>
                    {typeof item.product === "object" ? item.product.name : item.product}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "20px", textAlign: "center", color: "#e53e3e", backgroundColor: "#fff5f5", borderRadius: "8px", marginBottom: "25px" }}>
            🛒 העגלה שלך ריקה בשרת! הוסף מוצרים לעגלה לפני ביצוע הזמנה.
          </div>
        )}

        {/* ─── חלק ב': פרטי משלוח דינמיים מתוך ה-addresses ─── */}
        <h3 style={{ borderBottom: "2px solid #edf2f7", paddingBottom: "8px", color: "#4a5568", marginBottom: "15px" }}>2. כתובת למשלוח ותשלום</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#4a5568" }}>בחר כתובת שמורה:</label>
            {userProfile && userProfile.addresses.length > 0 ? (
              <select
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e0", background: "#fff", fontSize: "14px" }}
              >
                {userProfile.addresses.map((addr) => (
                  <option key={addr._id} value={addr._id}>
                    {addr.street} {addr.houseNumber}, {addr.city}
                  </option>
                ))}
              </select>
            ) : (
              <input 
                type="text"
                placeholder="אין כתובות שמורות, הזן ID ידני"
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e53e3e", outline: "none" }}
                required
              />
            )}
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#4a5568" }}>שיטת תשלום:</label>
            <select 
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e0", background: "#fff", fontSize: "14px" }}
            >
              <option value="credit">💳 כרטיס אשראי</option>
              <option value="paypal">🅿️ PayPal</option>
              <option value="simulated">🧪 סימולציה / טסט</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#4a5568" }}>הערות לשליח:</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e0", minHeight: "60px", resize: "none", fontSize: "14px" }}
          />
        </div>

        {/* סיכום משלוח קטן */}
        <div style={{ background: "#f7fafc", padding: "15px", borderRadius: "12px", marginBottom: "25px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "between", color: "#4a5568" }}>
          <span>עלות משלוח מחושבת (shipingCost):</span>
          <span style={{ marginRight: "auto", fontWeight: "600", color: "#2b6cb0" }}>₪{shipingCost}</span>
        </div>

        <button 
          type="submit" 
          disabled={loading || !userProfile || userProfile.cart.length === 0}
          style={{ width: "100%", padding: "14px", background: (loading || !userProfile || userProfile.cart.length === 0) ? "#cbd5e0" : "#3182ce", color: "#fff", border: "none", borderRadius: "8px", cursor: (loading || !userProfile || userProfile.cart.length === 0) ? "not-allowed" : "pointer", fontSize: "16px", fontWeight: "700" }}
        >
          {loading ? "מייצר הזמנה מהעגלה האמיתית..." : "אישור וביצוע ההזמנה (POST)"}
        </button>
      </form>

      {message && (
        <div style={{ marginTop: "20px", padding: "14px", borderRadius: "8px", backgroundColor: message.isError ? "#fff5f5" : "#f0fff4", color: message.isError ? "#c53030" : "#22543d", border: message.isError ? "1px solid #feb2b2" : "1px solid #9ae6b4", fontWeight: "600", textAlign: "center" }}>
          {message.text}
        </div>
      )}
    </div>
  );
}