"use client";

import React, { useEffect, useState } from "react";
import { statsService } from "@/lib/statsService";
import { DashboardStatsData } from "@/shared/stats.types";

export default function StoreMetricsDashboard() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await statsService.getDashboardStats();
        setStats(data);
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "שגיאה בטעינת המדדים. ודאי שאת מחוברת כאדמין.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <p style={{ textAlign: "center", marginTop: 40, fontFamily: "sans-serif" }}>
        🔄 טוען סקירת חנות...
      </p>
    );
  }

  if (error) {
    return (
      <p
        style={{
          textAlign: "center",
          marginTop: 40,
          color: "#c53030",
          fontFamily: "sans-serif",
        }}
      >
        ❌ {error}
      </p>
    );
  }

  if (!stats) {
    return (
      <p style={{ textAlign: "center", marginTop: 40, fontFamily: "sans-serif" }}>
        אין נתונים להצגה
      </p>
    );
  }

  const { summary, topSellingBySold, topOrderedFromOrders, lowStockProducts } =
    stats;
  const bestSeller = topSellingBySold[0];

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    textAlign: "center",
  };

  return (
    <div
      dir="rtl"
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: 24,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: 24, color: "#1a202c" }}>📊 סקירת חנות</h1>

      {/* כרטיסי סיכום */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div style={cardStyle}>
          <div style={{ color: "#718096", fontSize: 14 }}>הכנסות כוללות</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#2b6cb0" }}>
            ₪{summary.totalRevenue.toLocaleString()}
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#718096", fontSize: 14 }}>סה״כ הזמנות</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{summary.totalOrders}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#718096", fontSize: 14 }}>ממתינות</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#d69e2e" }}>
            {summary.pendingOrders}
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#718096", fontSize: 14 }}>מלאי נמוך (≤5)</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#e53e3e" }}>
            {summary.lowStockCount}
          </div>
        </div>
      </div>

      {/* מוצר מוביל */}
      <div
        style={{
          background: "#ebf8ff",
          padding: 20,
          borderRadius: 12,
          marginBottom: 32,
          border: "1px solid #bee3f8",
        }}
      >
        <h2 style={{ margin: "0 0 8px 0", fontSize: 18 }}>🏆 המוצר הכי נמכר</h2>
        {bestSeller ? (
          <p style={{ margin: 0, fontSize: 16 }}>
            <strong>{bestSeller.name}</strong> — נמכרו {bestSeller.sold} יחידות | במלאי:{" "}
            {bestSeller.stock}
          </p>
        ) : (
          <p style={{ margin: 0, color: "#718096" }}>אין עדיין מכירות</p>
        )}
      </div>

      {/* Top 5 לפי sold */}
      <Section title="Top 5 לפי יחידות שנמכרו (sold)">
        <SimpleTable
          headers={["מוצר", "נמכר", "במלאי", "מחיר"]}
          rows={topSellingBySold.map((p) => [
            p.name,
            String(p.sold ?? 0),
            String(p.stock),
            `₪${p.price}`,
          ])}
          emptyText="אין מוצרים"
        />
      </Section>

      {/* Top 5 מהזמנות */}
      <Section title="Top 5 לפי הזמנות (aggregation)">
        <SimpleTable
          headers={["מוצר", "כמות שהוזמנה", "הכנסה"]}
          rows={topOrderedFromOrders.map((p) => [
            p.name,
            String(p.totalQuantity),
            `₪${p.revenue.toLocaleString()}`,
          ])}
          emptyText="אין הזמנות עדיין"
        />
      </Section>

      {/* מלאי נמוך */}
      <Section title="מלאי נמוך — דורש пополнение">
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr style={{ background: "#f7fafc" }}>
              {["מוצר", "במלאי", "נמכר"].map((h) => (
                <th key={h} style={{ padding: 12, textAlign: "right" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lowStockProducts.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: 16, color: "#718096" }}>
                  אין מוצרים במלאי נמוך 🎉
                </td>
              </tr>
            ) : (
              lowStockProducts.map((p) => (
                <tr
                  key={p._id}
                  style={{
                    borderBottom: "1px solid #edf2f7",
                    color: p.stock === 0 ? "#c53030" : "#2d3748",
                    fontWeight: p.stock === 0 ? 700 : 400,
                  }}
                >
                  <td style={{ padding: 12 }}>{p.name}</td>
                  <td style={{ padding: 12 }}>{p.stock}</td>
                  <td style={{ padding: 12 }}>{p.sold ?? 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 17, marginBottom: 12, color: "#4a5568" }}>{title}</h2>
      {children}
    </div>
  );
}

function SimpleTable({
  headers,
  rows,
  emptyText,
}: {
  headers: string[];
  rows: string[][];
  emptyText: string;
}) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "#fff",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <thead>
        <tr style={{ background: "#f7fafc" }}>
          {headers.map((h) => (
            <th key={h} style={{ padding: 12, textAlign: "right" }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={headers.length} style={{ padding: 16, color: "#718096" }}>
              {emptyText}
            </td>
          </tr>
        ) : (
          rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #edf2f7" }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: 12 }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}