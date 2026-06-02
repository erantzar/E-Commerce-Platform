"use client";

import React, { useState, useEffect } from "react";
import { productService } from "@/lib/productService";

interface IUser {
  _id: string;
  name: string;
  email: string;
  role: string; // 'user' | 'admin' וכו'
  isVerified: boolean;
  createdAt: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // 1. טעינת כל המשתמשים מהשרת
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await productService.getAllUsers();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to load users", err);
      setMessage({ text: "שגיאה בטעינת רשימת המשתמשים. ודא שאתה מחובר כאדמין.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // 2. שינוי תפקיד משתמש (החלפת רול)
  const handleToggleRole = async (userId: string, currentRole: string) => {
    setActionLoading(userId);
    setMessage(null);
    try {
      await productService.updateUserRole(userId);
      setMessage({ text: `תפקיד המשתמש עודכן בהצלחה!`, isError: false });
      await loadUsers(); // רענון הטבלה
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || "עדכון התפקיד נכשל", isError: true });
    } finally {
      setActionLoading(null);
    }
  };

  // 3. מחיקת משתמש מהמערכת
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`האם אתה בטוח לחלוטין שברצונך למחוק את המשתמש "${userName}"?`)) return;

    setActionLoading(userId);
    setMessage(null);
    try {
      await productService.deleteUser(userId);
      setMessage({ text: `המשתמש "${userName}" נמחק בהצלחה מהמערכת.`, isError: false });
      await loadUsers(); // רענון הטבלה
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || "מחיקת המשתמש נכשלה", isError: true });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "sans-serif" }}>🔄 טוען את רשימת המשתמשים מהשרת...</div>;
  }

  return (
    <div style={{ maxWidth: "950px", margin: "30px auto", padding: "30px", border: "1px solid #e2e8f0", borderRadius: "16px", backgroundColor: "#fff", direction: "rtl", fontFamily: "system-ui, sans-serif", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
      
      <div style={{ marginBottom: "20px", borderBottom: "2px solid #edf2f7", paddingBottom: "10px" }}>
        <h2 style={{ margin: 0, color: "#1a202c" }}>ניהול משתמשים והרשאות (Admin Console)</h2>
        <p style={{ margin: "5px 0 0 0", color: "#718096", fontSize: "14px" }}>צפייה, שינוי תפקידים ומחיקת משתמשים רשומים במערכת.</p>
      </div>

      {message && (
        <div style={{ marginBottom: "20px", padding: "12px", borderRadius: "8px", backgroundColor: message.isError ? "#fff5f5" : "#f0fff4", color: message.isError ? "#c53030" : "#22543d", border: message.isError ? "1px solid #feb2b2" : "1px solid #9ae6b4", textAlign: "center", fontWeight: "600" }}>
          {message.text}
        </div>
      )}

      {users.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "14px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f7fafc", borderBottom: "2px solid #edf2f7" }}>
                <th style={{ padding: "12px", color: "#4a5568" }}>שם המשתמש</th>
                <th style={{ padding: "12px", color: "#4a5568" }}>כתובת אימייל</th>
                <th style={{ padding: "12px", color: "#4a5568", textAlign: "center" }}>סטטוס אימות</th>
                <th style={{ padding: "12px", color: "#4a5568", textAlign: "center" }}>תפקיד (Role)</th>
                <th style={{ padding: "12px", color: "#4a5568", textAlign: "left" }}>פעולות ניהול</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ borderBottom: "1px solid #edf2f7", transition: "background 0.2s" }}>
                  <td style={{ padding: "12px", fontWeight: "600", color: "#2d3748" }}>{user.name}</td>
                  <td style={{ padding: "12px", color: "#4a5568", fontFamily: "monospace" }}>{user.email}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{ padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "500", backgroundColor: user.isVerified ? "#c6f6d5" : "#feebc8", color: user.isVerified ? "#22543d" : "#744210" }}>
                      {user.isVerified ? "מאומת ✓" : "לא מאומת"}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{ padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", backgroundColor: user.role === "admin" ? "#e9d8fd" : "#edf2f7", color: user.role === "admin" ? "#553c9a" : "#4a5568", border: user.role === "admin" ? "1px solid #d6bcfa" : "1px solid #e2e8f0" }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "left", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    
                    {/* כפתור שינוי תפקיד */}
                    {user.role !== "admin" && (
                    <button
                      type="button"
                      onClick={() => handleToggleRole(user._id, user.role)}
                      disabled={actionLoading === user._id}
                      style={{ padding: "6px 12px", background: "#3182ce", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                    >
                      {actionLoading === user._id ? "מעדכן..." : user.role === "admin" ? "הפוך לרגיל" : "הפוך לאדמין"}
                    </button>
                    )}
                    {/* כפתור מחיקה */}
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(user._id, user.name)}
                      disabled={actionLoading === user._id}
                      style={{ padding: "6px 12px", background: "#fff5f5", color: "#e53e3e", border: "1px solid #fed7d7", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                    >
                      {actionLoading === user._id ? "מוחק..." : "מחק משתמש"}
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "30px", color: "#718096", backgroundColor: "#f7fafc", borderRadius: "8px" }}>
          📭 לא נמצאו משתמשים רשומים במערכת.
        </div>
      )}
    </div>
  );
}