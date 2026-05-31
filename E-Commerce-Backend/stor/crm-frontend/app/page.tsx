"use client";

import React, { useState, useEffect } from "react";
import { productService } from "@/lib/productService";
import CartSidebar from "@/features/cart/CartSidebar";

export default function StoreHomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // ניהול חלונית האותנטיקציה (Modal)
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  // קרוסלה דמו
  const carouselImages = [
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1472851294608-062f824d286e?auto=format&fit=crop&w=800&q=80"
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  // 1. טעינת מוצרים ובדיקת סטטוס חיבור בטעינת העמוד
  useEffect(() => {
    const initStore = async () => {
      // א. טעינת מוצרים מהשרת
      try {
        const responseData = await productService.getPublicProducts();
        
        // הדפסה לטרמינל/דפדפן לצורך ניטור ומעקב
        console.log("נתוני מוצרים שהתקבלו בקומפוננטה:", responseData);

        // בדיקה מקיפה של מבנה הנתונים לחילוץ המערך בצורה בטוחה
        if (Array.isArray(responseData)) {
          setProducts(responseData);
        } else if (responseData?.data && Array.isArray(responseData.data)) {
          setProducts(responseData.data);
        } else if (responseData?.products && Array.isArray(responseData.products)) {
          setProducts(responseData.products);
        } else {
          console.warn("הנתונים התקבלו מהשרת אך לא זוהו כמערך תקין:", responseData);
          setProducts([]);
        }
      } catch (err) {
        console.error("טעינת מוצרים נכשלה בשל שגיאת תקשורת:", err);
        setProducts([]);
      }

      // ב. בדיקה אם המשתמש מחובר (קיים טוקן)
      const token = localStorage.getItem("token");
      if (token) {
        setIsLoggedIn(true);
      }

      // ג. טעינת העגלה מתוך ה-localStorage (תמיד טוענים מכאן!)
      const localCart = localStorage.getItem("guest_cart");
      if (localCart) {
        setCart(JSON.parse(localCart));
      }
    };
    initStore();
  }, []);

  // ─── 🛒 ניהול העגלה הבלעדי ב-LocalStorage ───

  // 1. הוספה לעגלה
  const handleAddToCart = (product: any) => {
    const updatedCart = [...cart];
    const existing = updatedCart.find(
      (item) => (typeof item.product === "object" ? item.product._id : item.product) === product._id
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      updatedCart.push({ product: product, quantity: 1 });
    }

    setCart(updatedCart);
    localStorage.setItem("guest_cart", JSON.stringify(updatedCart));
  };

  // 2. עדכון כמות פריט
  const handleUpdateQty = (itemId: string, newQty: number) => {
    const updatedCart = cart.map((item) => {
      const id = typeof item.product === "object" ? item.product._id : item.product;
      return id === itemId ? { ...item, quantity: newQty } : item;
    });
    
    setCart(updatedCart);
    localStorage.setItem("guest_cart", JSON.stringify(updatedCart));
  };

  // 3. מחיקת פריט בודד
  const handleRemoveItem = (itemId: string) => {
    const updatedCart = cart.filter(
      (item) => (typeof item.product === "object" ? item.product._id : item.product) !== itemId
    );
    
    setCart(updatedCart);
    localStorage.setItem("guest_cart", JSON.stringify(updatedCart));
  };

  // 4. רוקן עגלה
  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem("guest_cart");
  };

  // 5. לחיצה על כפתור "מעבר לתשלום"
  const handleCheckout = () => {
    if (isLoggedIn) {
      // מחובר? שלחי אותו לעמוד ההזמנה
      window.location.href = "/dashboard/orders";
    } else {
      // לא מחובר? פתחי מודאל והגבילי אותו
      setAuthMessage("כדי להשלים את ההזמנה ולבצע תשלום, יש להתחבר או להירשם תחילה.");
      setAuthMode("login");
    }
  };

  // ─── 🔐 התחברות וסנכרון עגלה (Sync) ───
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage("");
    try {
      await productService.loginUser({ email, password });
      setIsLoggedIn(true);
      setAuthMode(null);

      // ברגע שהתחבר - אם יש מוצרים בעגלה המקומית, נסנכרן אותם ל-DB של השרת
      const localCart = localStorage.getItem("guest_cart");
      if (localCart) {
        const guestItems = JSON.parse(localCart).map((item: any) => ({
          product: typeof item.product === "object" ? item.product._id : item.product,
          quantity: item.quantity
        }));
        
        if (guestItems.length > 0) {
          try {
            await productService.syncCart(guestItems);
            console.log("העגלה המקומית סונכרנה עם השרת בהצלחה!");
          } catch (syncErr) {
            console.error("סנכרון העגלה מול השרת נכשל", syncErr);
          }
        }
      }

      // מעבר אוטומטי לעמוד התשלום מכיוון שהוא רצה לבצע checkout
      window.location.href = "/checkout";

    } catch (err: any) {
      setAuthMessage(err.response?.data?.message || "פרטי התחברות שגויים, נסה שנית.");
    }
  };

  const handleLogout = async () => {
    try {
      await productService.logoutUser("");
    } catch (err) {
      console.log("התנתקות מקומית");
    } finally {
      setIsLoggedIn(false);
      handleClearCart(); // מנקים את העגלה בזמן התנתקות
    }
  };

  return (
    <div style={{ direction: "rtl", fontFamily: "system-ui", minHeight: "100vh", backgroundColor: "#f7fafc" }}>
      {/* NAVBAR */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 40px", backgroundColor: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <h2 style={{ margin: 0, color: "#2b6cb0", cursor: "pointer" }} onClick={() => window.location.href = "/"}>🛍️ Storefront</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          {isLoggedIn ? (
            <>
              <button onClick={() => window.location.href = "/dashboard/profile"} style={{ padding: "8px 16px", background: "#edf2f7", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>👤 אזור אישי</button>
              <button onClick={handleLogout} style={{ padding: "8px 16px", background: "#e53e3e", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>להתנתק</button>
            </>
          ) : (
            <>
              <button onClick={() => { setAuthMode("login"); setAuthMessage(""); }} style={{ padding: "8px 16px", background: "#3182ce", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>התחברות</button>
              {/* <button onClick={() => { setAuthMode("register"); setAuthMessage(""); }} style={{ padding: "8px 16px", background: "#48bb78", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>הרשמה</button> */}
              <button onClick={() => { window.location.href = "/register"; }} style={{ padding: "8px 16px", background: "#48bb78", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>הרשמה1</button>
            </>
          )}
        </div>
      </nav>

      {/* קרוסלה */}
      <div style={{ position: "relative", maxWidth: "1200px", margin: "20px auto", height: "320px", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
        <img src={carouselImages[currentSlide]} alt="מבצעים" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <button onClick={() => setCurrentSlide((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1))} style={{ position: "absolute", top: "50%", left: "15px", transform: "translateY(-50%)", padding: "10px", background: "rgba(255,255,255,0.7)", border: "none", borderRadius: "50%", cursor: "pointer" }}>◀</button>
        <button onClick={() => setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1))} style={{ position: "absolute", top: "50%", right: "15px", transform: "translateY(-50%)", padding: "10px", background: "rgba(255,255,255,0.7)", border: "none", borderRadius: "50%", cursor: "pointer" }}>▶</button>
      </div>

      {/* תוכן ראשי */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "30px", maxWidth: "1200px", margin: "30px auto", padding: "0 20px" }}>
        
        {/* קטלוג מוצרים */}
        <div>
          <h3 style={{ marginBottom: "20px", color: "#2d3748" }}>🏷️ המוצרים המומלצים שלנו</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            {Array.isArray(products) && products.length > 0 ? (
              products.map((prod) => (
                <div key={prod._id} style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "15px", backgroundColor: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <div style={{ height: "140px", backgroundColor: "#edf2f7", borderRadius: "8px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "45px" }}>📦</div>
                  <div>
                    <h4 style={{ margin: "0 0 6px 0", color: "#2d3748" }}>{prod.name}</h4>
                    <p style={{ color: "#718096", fontSize: "13px", margin: "0 0 12px 0", height: "36px", overflow: "hidden" }}>{prod.description || "אין תיאור זמין עבור מוצר זה"}</p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                    <span style={{ fontWeight: "bold", color: "#2b6cb0", fontSize: "16px" }}>{prod.price} ₪</span>
                    <button onClick={() => handleAddToCart(prod)} style={{ padding: "8px 14px", background: "#3182ce", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>הוסף לעגלה</button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "#718096" }}>טוען מוצרים או שלא נמצאו מוצרים בחנות...</p>
            )}
          </div>
        </div>

        {/* עגלת קניות ציבורית */}
        <CartSidebar 
          cartItems={cart} 
          onUpdateQty={handleUpdateQty} 
          onRemove={handleRemoveItem} 
          onClear={handleClearCart}
          onCheckout={handleCheckout} 
        />
      </div>

      {/* AUTH MODAL */}
      {authMode && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(2px)" }}>
          <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "16px", width: "400px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0 }}>{authMode === "login" ? "התחברות לחנות" : authMode === "register" ? "הרשמת משתמש חדש" : "שחזור סיסמה"}</h3>
              <button onClick={() => setAuthMode(null)} style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer", color: "#a0aec0" }}>✕</button>
            </div>
            
            {authMessage && <div style={{ color: "#e53e3e", backgroundColor: "#fff5f5", padding: "10px", borderRadius: "6px", marginBottom: "15px", fontSize: "13px", border: "1px solid #fed7d7" }}>{authMessage}</div>}

            <form onSubmit={handleLoginSubmit}>
              {authMode === "register" && (
                <input type="text" placeholder="שם מלא" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "11px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #cbd5e0", boxSizing: "border-box" }} required />
              )}
              <input type="email" placeholder="כתובת אימייל" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "11px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #cbd5e0", boxSizing: "border-box" }} required />
              {authMode !== "forgot" && (
                <input type="password" placeholder="סיסמה" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "11px", marginBottom: "15px", borderRadius: "8px", border: "1px solid #cbd5e0", boxSizing: "border-box" }} required />
              )}
              
              <button type="submit" style={{ width: "100%", padding: "12px", background: "#3182ce", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "15px" }}>
                {authMode === "login" ? "התחבר והמשך לתשלום" : authMode === "register" ? "בצע הרשמה" : "שלח קישור שחזור"}
              </button>
            </form>

            {authMode === "login" && (
              <p onClick={() => setAuthMode("forgot")} style={{ textAlign: "center", color: "#3182ce", fontSize: "13px", cursor: "pointer", marginTop: "15px", marginBottom: 0 }}>שכחתי סיסמה...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}