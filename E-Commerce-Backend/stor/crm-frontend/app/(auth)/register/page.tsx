"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "@/features/auth/authSlice";
import { AppDispatch, RootState } from "@/store"; // ודאי שהקמת את ה-store המרכזי
import { toast } from "react-toastify";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // שליחת הנתונים לשרת דרך ה-Thunk של Redux
    const resultAction = await dispatch(registerUser({ name, email, password }));

    if (registerUser.fulfilled.match(resultAction)) {
      toast.success("נרשמת בהצלחה! בדוק את תיבת המייל שלך לאימות החשבון."); // בהתאם לאפיון של אימות מייל
      // איפוס השדות
      setName("");
      setEmail("");
      setPassword("");
    } else {
      // הצגת השגיאה שהשרת החזיר (למשל: סיסמה חלשה מדי או מייל תפוס)
      toast.error(resultAction.payload as string);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4" dir="rtl">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md border border-slate-200">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">יצירת חשבון חדש</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">שם מלא</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 text-slate-900 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">אימייל</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 text-slate-900 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 text-slate-900 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 p-2 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            {isLoading ? "שולח בקשה..." : "הרשמה"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          כבר יש לך חשבון?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            התחבר כאן
          </Link>
        </p>
      </div>
    </div>
  );
}