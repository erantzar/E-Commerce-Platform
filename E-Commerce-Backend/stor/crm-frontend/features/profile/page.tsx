"use client";

import React, { useState, useEffect } from "react";
import { productService } from "@/lib/productService";

interface IAddress {
  _id: string;
  city: string;
  street: string;
  houseNumber: number;
  zip: string;
}

export default function UserProfile() {
  // סטייט לנתוני פרופיל
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [addresses, setAddresses] = useState<IAddress[]>([]);

  // סטייט לשינוי סיסמה
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // סטייט ליצירת כתובת חדשה
  const [newCity, setNewCity] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newHouseNumber, setNewHouseNumber] = useState<number | "">("");
  const [newZip, setNewZip] = useState("");

  // סטייט כללי למערכת
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // 1. טעינת נתוני הפרופיל מהשרת בטעינת הרכיב
  const loadProfileData = async () => {
    try {
      const response = await productService.getUserProfile();
      const user = response?.data;
      if (user) {
        setName(user.name || "");
        setEmail(user.email || "");
        setAddresses(user.addresses || []);
      }
    } catch (err) {
      console.error("Failed to load profile", err);
      setMessage({ text: "שגיאה בטעינת נתוני הפרופיל", isError: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  // 2. עדכון שם ואימייל
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await productService.updateUserProfile({ name, email });
      setMessage({ text: "הפרופיל עודכן בהצלחה!", isError: false });
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || "עדכון הפרופיל נכשל", isError: true });
    }
  };

  // 3. עדכון סיסמה
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await productService.changePassword({ oldPassword, newPassword });
      setMessage({ text: "הסיסמה שונתה בהצלחה!", isError: false });
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || "שינוי הסיסמה נכשל", isError: true });
    }
  };

  // 4. הוספת כתובת חדשה
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity || !newStreet || !newHouseNumber) return;
    setMessage(null);
    try {
      await productService.createAddress({
        city: newCity,
        street: newStreet,
        houseNumber: Number(newHouseNumber),
        zip: newZip,
      });
      setMessage({ text: "הכתובת הוספה בהצלחה!", isError: false });
      // איפוס שדות הכתובת וטעינה מחדש
      setNewCity("");
      setNewStreet("");
      setNewHouseNumber("");
      setNewZip("");
      loadProfileData();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || "הוספת הכתובת נכשלה", isError: true });
    }
  };

  // 5. מחיקת כתובת
  const handleDeleteAddress = async (addrId: string) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק כתובת זו?")) return;
    setMessage(null);
    try {
      await productService.deleteAddress(addrId);
      setMessage({ text: "הכתובת נמחקה בהצלחה!", isError: false });
      loadProfileData(); // רענון הרשימה
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || "מחיקת הכתובת נכשלה", isError: true });
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>🔄 טוען פרופיל משתמש...</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "30px auto", padding: "30px", border: "1px solid #e2e8f0", borderRadius: "16px", backgroundColor: "#fff", direction: "rtl", fontFamily: "system-ui, sans-serif" }}>
      
      <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#1a202c" }}>האזור האישי והפרופיל שלי</h2>

      {message && (
        <div style={{ marginBottom: "20px", padding: "12px", borderRadius: "8px", backgroundColor: message.isError ? "#fff5f5" : "#f0fff4", color: message.isError ? "#c53030" : "#22543d", border: message.isError ? "1px solid #feb2b2" : "1px solid #9ae6b4", textAlign: "center", fontWeight: "600" }}>
          {message.text}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
        
        {/* ─── טופס א': עדכון פרטי פרופיל ─── */}
        <div style={{ border: "1px solid #edf2f7", padding: "20px", borderRadius: "12px", backgroundColor: "#f7fafc" }}>
          <h3 style={{ marginTop: 0, color: "#4a5568", borderBottom: "2px solid #edf2f7", paddingBottom: "6px" }}>עדכון פרטים אישיים</h3>
          <form onSubmit={handleUpdateProfile}>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "600" }}>שם מלא:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e0" }} required />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "600" }}>אימייל:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e0" }} required />
            </div>
            <button type="submit" style={{ width: "100%", padding: "10px", background: "#3182ce", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>עדכן פרופיל</button>
          </form>
        </div>

        {/* ─── טופס ב': שינוי סיסמה ─── */}
        <div style={{ border: "1px solid #edf2f7", padding: "20px", borderRadius: "12px", backgroundColor: "#f7fafc" }}>
          <h3 style={{ marginTop: 0, color: "#4a5568", borderBottom: "2px solid #edf2f7", paddingBottom: "6px" }}>אבטחה ושינוי סיסמה</h3>
          <form onSubmit={handlePasswordChange}>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "600" }}>סיסמה ישנה:</label>
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e0" }} required />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "600" }}>סיסמה חדשה:</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e0" }} required />
            </div>
            <button type="submit" style={{ width: "100%", padding: "10px", background: "#4a5568", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>שנה סיסמה</button>
          </form>
        </div>

      </div>

      {/* ─── חלק ג': ניהול כתובות (CRUD) ─── */}
      <div style={{ marginTop: "30px", border: "1px solid #edf2f7", padding: "20px", borderRadius: "12px" }}>
        <h3 style={{ marginTop: 0, color: "#4a5568", borderBottom: "2px solid #edf2f7", paddingBottom: "6px" }}>כתובות למשלוח שמורות במערכת</h3>
        
        {/* רשימת הכתובות הקיימות */}
        {addresses.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "25px" }}>
            {addresses.map((addr) => (
              <div key={addr._id} style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff" }}>
                <div>
                  <strong style={{ color: "#2d3748" }}>{addr.street} {addr.houseNumber}</strong>
                  <div style={{ fontSize: "13px", color: "#718096" }}>{addr.city}, מיקוד: {addr.zip || "אין"}</div>
                </div>
                <button type="button" onClick={() => handleDeleteAddress(addr._id)} style={{ padding: "6px 10px", backgroundColor: "#fff5f5", color: "#e53e3e", border: "1px solid #fed7d7", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>מחק</button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#a0aec0", fontStyle: "italic", marginBottom: "25px" }}>לא נשמרו כתובות עדיין במערכת.</p>
        )}

        {/* טופס הוספת כתובת חדשה */}
        <h4 style={{ margin: "0 0 12px 0", color: "#4a5568" }}>➕ הוסף כתובת חדשה לחשבון</h4>
        <form onSubmit={handleAddAddress} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 2fr 1.5fr", gap: "10px", alignItems: "end" }}>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "600" }}>עיר:</label>
            <input type="text" value={newCity} onChange={(e) => setNewCity(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e0" }} required />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "600" }}>רחוב:</label>
            <input type="text" value={newStreet} onChange={(e) => setNewStreet(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e0" }} required />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "600" }}>מספר:</label>
            <input type="number" value={newHouseNumber} onChange={(e) => setNewHouseNumber(e.target.value !== "" ? Number(e.target.value) : "")} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e0" }} required />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "600" }}>מיקוד (Zip):</label>
            <input type="text" value={newZip} onChange={(e) => setNewZip(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e0" }} />
          </div>
          <button type="submit" style={{ padding: "10px", background: "#38a169", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>שמור כתובת</button>
        </form>
      </div>

    </div>
  );
}