"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { adminLogin } from "@/features/auth/authSlice";
import { AppDispatch, RootState } from "@/app/store";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const resultAction = await dispatch(adminLogin({ email, password }));

    if (adminLogin.fulfilled.match(resultAction)) {
      toast.success("הפרטים אומתו! קוד אבטחה נשלח לתיבת המייל שלך.");
      
      // חילוץ ה-ID מתוך ה-data שהשרת שלך מחזיר
      const userId = resultAction.payload?.data?.userId || resultAction.payload?.userId || resultAction.payload?.id;
      
      if (userId) {
        // מעביר אוטומטית לעמוד ה-2FA ומצרף את ה-userId לכתובת למעלה
        router.push(`/verify-2fa?userId=${userId}`);
      } else {
        router.push("/verify-2fa");
      }
    } else {
      const errorMessage = (resultAction.payload as string) || "שגיאה בהתחברות מנהל.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8" dir="rtl">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900">
            כניסת מנהל מערכת CRM
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">אזור מוגן לצוות בלבד</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <input
              type="email"
              required
              className="relative block w-full rounded-md border py-2 text-gray-900 px-3 border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-600"
              placeholder="אימייל מנהל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              className="relative block w-full rounded-md border py-2 text-gray-900 px-3 border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-600"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:bg-slate-400"
          >
            {isLoading ? "מבצע בדיקה..." : "המשך לקבלת קוד"}
          </button>
        </form>
      </div>
    </div>
  );
}