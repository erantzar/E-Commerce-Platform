"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
// אופציונלי לאדמין:
// import StoreMetricsDashboard from "@/features/dashboard/StoreMetricsDashboard";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    setIsAdmin(localStorage.getItem("role") === "admin");
  }, []);

  return (
    <div dir="rtl" style={{ minHeight: "calc(100vh - 60px)", background: "#f8fafc" }}>
      {/* Hero */}
      <section style={{ textAlign: "center", padding: "48px 24px 32px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#1a202c", marginBottom: 12 }}>
          ברוכים הבאים ל-MyStore
        </h1>
        <p style={{ color: "#718096", fontSize: 18, maxWidth: 520, margin: "0 auto" }}>
          ניהול חנות, הזמנות ומוצרים — במקום אחד.
        </p>
        {!isLoggedIn && (
          <Link href="/login" style={{ /* כפתור כחול כמו ב-Navbar */ }}>
            התחברות למערכת
          </Link>
        )}
      </section>

      {/* כרטיסי קיצורי דרך — רק למחובר */}
      {isLoggedIn && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          maxWidth: 900,
          margin: "0 auto",
          padding: "0 24px 48px",
        }}>
          {[
            { href: "/dashboard/profile", icon: "👤", title: "הפרופיל שלי" },
            { href: "/dashboard/orders", icon: "📦", title: "ההזמנות שלי" },
            { href: "/dashboard/products", icon: "🏷️", title: "מוצרים" },
            { href: "/dashboard/users", icon: "📊", title: "סקירת חנות" },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ /* כרטיס לבן + צל */ }}>
              <span>{item.icon}</span>
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      )}

      {/* אופציונלי: דשבורד מלא רק לאדמין */}
      {/* {isAdmin && <StoreMetricsDashboard />} */}
    </div>
  );
}