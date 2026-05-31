"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // בדיקה אם המשתמש מחובר
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("guest_cart");
    window.location.href = "/";
  };

  // פונקציית עזר לעיצוב קישור אקטיבי (מודגש בכחול אם אנחנו בעמוד שלו)
  const linkStyle = (path: string) => ({
    textDecoration: "none",
    color: pathname === path ? "#3182ce" : "#4a5568",
    fontWeight: pathname === path ? "700" : "500",
    fontSize: "15px",
    transition: "color 0.2s ease",
  });

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 40px",
      backgroundColor: "#ffffff",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      direction: "rtl",
      fontFamily: "system-ui, -apple-system, sans-serif",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      
      {/* שמאל / ימין: לוגו האתר */}
      <div style={{ fontSize: "22px", fontWeight: "bold" }}>
        <Link href="/" style={{ textDecoration: "none", color: "#2b6cb0", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🛍️</span>
          <span>MyStore</span>
        </Link>
      </div>

      {/* מרכז: קישורי הניווט הציבוריים והאישיים */}
      <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
        <Link href="/" style={linkStyle("/")}>🏠 בית</Link>
        
        {isLoggedIn && (
          <>
            {/* קישורי דאשבורד למשתמש מחובר */}
            <Link href="/dashboard/profile" style={linkStyle("/dashboard/profile")}>👤 הפרופיל שלי</Link>
            <Link href="/dashboard/orders" style={linkStyle("/dashboard/orders")}>📦 ההזמנות שלי</Link>
            <Link href="/dashboard/products" style={linkStyle("/dashboard/products")}>🏷️ מוצרים</Link>
            <Link href="/dashboard/users" style={linkStyle("/dashboard/users")}>👥 משתמשי דאשבורד</Link>
            
            {/* קישור לאזור הניהול של האדמין */}
            <Link href="/admin/users" style={linkStyle("/admin/users")}>🔑 ניהול אדמין</Link>
          </>
        )}
      </div>

      {/* שמאל: כפתור כניסה / יציאה */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {isLoggedIn ? (
          <button 
            onClick={handleLogout} 
            style={{
              padding: "8px 16px",
              background: "#e53e3e",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px"
            }}
          >
            להתנתק
          </button>
        ) : (
          <Link 
            href="/login" 
            style={{
              padding: "8px 18px",
              background: "#3182ce",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "600",
              boxShadow: "0 2px 4px rgba(49, 130, 206, 0.2)"
            }}
          >
            התחברות
          </Link>
        )}
      </div>

    </nav>
  );
}