"use client";

import React, { useState, useEffect } from "react";
import { productService } from "@/lib/productService";
import CartSidebar from "@/features/cart/CartSidebar";
import { enrichCartItems } from "@/lib/cartUtils";
import ProductCard from "@/features/products/ProductCard";
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

// ג. טעינת עגלה — לפי מצב התחברות
const token = localStorage.getItem("token");
const loggedIn = !!token;
setIsLoggedIn(loggedIn);

if (loggedIn) {
  try {
    const rawCart = await productService.getCart();
    setCart(await enrichCartItems(rawCart));
    setIsLoggedIn(true);
  } catch (err) {
    console.error("טעינת עגלה מהשרת נכשלה:", err);
    setCart([]);
  }
} else {
  const localCart = localStorage.getItem("guest_cart");
  if (localCart) {
    setCart(JSON.parse(localCart));
  }
}
    };
    initStore();
  }, []);

  // ─── 🛒 ניהול העגלה הבלעדי ב-LocalStorage ───

  // 1. הוספה לעגלה
  const handleAddToCart = async (product: any) => {
    if (isLoggedIn) {
      try {
        await productService.addToCart(product._id, 1);
        const rawCart = await productService.getCart();
        const enriched = await enrichCartItems(rawCart);
        setCart(enriched);
      } catch (err) {
        console.error("הוספה לעגלה בשרת נכשלה", err);
      }
      return;
    }
  
    // אורח — localStorage (הקוד הקיים)
    const updatedCart = [...cart];
    const existing = updatedCart.find(
      (item) =>
        (typeof item.product === "object" ? item.product._id : item.product) ===
        product._id
    );
    if (existing) existing.quantity += 1;
    else updatedCart.push({ product, quantity: 1 });
    setCart(updatedCart);
    localStorage.setItem("guest_cart", JSON.stringify(updatedCart));
  };

  // 2. עדכון כמות פריט
  const handleUpdateQty = async (productId: string, newQty: number) => {
    if (newQty < 1) return;
  
    if (isLoggedIn) {
      try {
        await productService.updateCartItem(productId, newQty);
        const rawCart = await productService.getCart();
        setCart(await enrichCartItems(rawCart));
      } catch (err) {
        console.error(err);
      }
      return;
    }
  
    // אורח — הקוד הקיים + localStorage
  };

  // 3. מחיקת פריט בודד
  const handleRemoveItem = async (productId: string) => {
    if (isLoggedIn) {
      await productService.deleteCartItem(productId);
      const rawCart = await productService.getCart();
      setCart(await enrichCartItems(rawCart));
      return;
    }
    // אורח — filter + localStorage ריקון עגלה
  };
  const handleClearCart = async () => {
    if (isLoggedIn) {
      await productService.clearCart();
      setCart([]);
      return;
    }
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
      window.location.href = "/login";
    }
  };

// ─── 🔐 התחברות וסנכרון עגלה (Sync) ───
const handleLoginSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setAuthMessage("");
  try {
    // 1. ביצוע התחברות
    await productService.loginUser({ email, password });
    setIsLoggedIn(true);
    setAuthMode(null);

    // 2. שליפת העגלה המקומית מהדפדפן
    const localCart = localStorage.getItem("guest_cart");
    if (localCart) {
      const guestItems = JSON.parse(localCart).map((item: any) => ({
        product: typeof item.product === "object" ? item.product._id : item.product,
        quantity: item.quantity
      }));
      
      if (guestItems.length > 0) {
        try {
          // סנכרון מול השרת
          await productService.syncCart(guestItems);
          console.log("העגלה המקומית סונכרנה עם השרת בהצלחה!");
        } catch (syncErr) {
          console.error("סנכרון העגלה מול השרת נכשל", syncErr);
        }
      }
    }

    // 🔥 הקסם החדש: במקום להעביר עמוד, אנחנו מרעננים קלות את דף הבית
    // כדי שה-useEffect של טעינת העמוד ירוץ מחדש, יזהה שהמשתמש מחובר,
    // ימשוך את העגלה המלאה מהשרת ויציג אותה מיד בעגלה בצד שמאל!
    console.log("🔄 מתחבר ומעדכן את העגלה על המסך...");
    window.location.reload();

  } catch (err: any) {
    setAuthMessage(err.response?.data?.message || "פרטי התחברות שגויים, נסה שנית.");
  }
};

  const handleLogout = async () => {
    try {
      await productService.logoutUser("");
    } catch (err) {
      console.log("התנתקות מקומית");
    }finally {
      setIsLoggedIn(false);
      setCart([]);                    // רק UI — לא למחוק עגלה בשרת
      localStorage.removeItem("guest_cart");
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
              <button onClick={() => {  window.location.href = "/login"; }} style={{ padding: "8px 16px", background: "#3182ce", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>התחברות</button>
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
    <ProductCard
      key={prod._id}
      product={prod}
      onAddToCart={handleAddToCart}
    />
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